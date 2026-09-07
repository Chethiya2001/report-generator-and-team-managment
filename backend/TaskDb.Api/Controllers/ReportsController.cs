using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskDb.Application.DTOs;
using TaskDb.Domain.Entities;
using TaskDb.Infrastructure.Data;

namespace TaskDb.Api.Controllers;

[ApiController, Route("api/reports"), Authorize]
public class ReportsController(TaskDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsManager => User.IsInRole("manager");

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? userId, [FromQuery] int? projectId, [FromQuery] string? status, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = FullQuery();
        if (!IsManager) query = query.Where(x => x.UserId == UserId);
        else if (userId.HasValue) query = query.Where(x => x.UserId == userId);
        if (projectId.HasValue) query = query.Where(x => x.ProjectId == projectId);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.Status == status);
        if (from.HasValue) query = query.Where(x => x.WeekStart >= from.Value);
        if (to.HasValue) query = query.Where(x => x.WeekEnd <= to.Value);
        var total = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.WeekStart).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(new { items = rows.Select(x => ToDto(x, !(IsManager && x.Status == "Draft"))), total, page, pageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var report = await FullQuery().SingleOrDefaultAsync(x => x.Id == id);
        return report is null ? NotFound() : !IsManager && report.UserId != UserId ? Forbid() : IsManager && report.Status == "Draft" ? Forbid() : Ok(ToDto(report));
    }

    [HttpPost, Authorize(Roles = "team_member")]
    public async Task<IActionResult> Create(ReportInput input)
    {
        var validation = Validate(input); if (validation is not null) return BadRequest(new { message = validation });
        if (await db.Reports.AnyAsync(x => x.UserId == UserId && x.ProjectId == input.ProjectId && x.WeekStart == input.WeekStart.Date))
            return Conflict(new { message = "A report already exists for this project and week." });
        var report = new Report { UserId = UserId, ProjectId = input.ProjectId, WeekStart = input.WeekStart.Date, WeekEnd = input.WeekEnd.Date, Status = "Draft" };
        report.Versions.Add(BuildVersion(input, 1)); db.Reports.Add(report); await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = report.Id }, ToDto((await FullQuery().SingleAsync(x => x.Id == report.Id))));
    }

    [HttpPut("{id:int}"), Authorize(Roles = "team_member")]
    public async Task<IActionResult> Update(int id, ReportInput input)
    {
        var validation = Validate(input); if (validation is not null) return BadRequest(new { message = validation });
        var report = await db.Reports.Include(x => x.Versions).ThenInclude(x => x.Tasks).Include(x => x.Versions).ThenInclude(x => x.Blockers).Include(x => x.Versions).ThenInclude(x => x.Achievements).Include(x => x.Versions).ThenInclude(x => x.WorkHours).Include(x => x.Versions).ThenInclude(x => x.Links).SingleOrDefaultAsync(x => x.Id == id);
        if (report is null) return NotFound(); if (report.UserId != UserId) return Forbid();
        if (report.Status is not ("Draft" or "Needs Correction")) return Conflict(new { message = "Only drafts and reports needing correction can be edited." });
        if (report.Status == "Needs Correction") { report.CurrentVersion++; report.Versions.Add(BuildVersion(input, report.CurrentVersion)); report.Status = "Draft"; }
        else { var current = report.Versions.Single(x => x.VersionNumber == report.CurrentVersion); db.ReportVersions.Remove(current); report.Versions.Add(BuildVersion(input, report.CurrentVersion)); }
        report.ProjectId = input.ProjectId; report.WeekStart = input.WeekStart.Date; report.WeekEnd = input.WeekEnd.Date; report.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(); return Ok(ToDto(await FullQuery().SingleAsync(x => x.Id == id)));
    }

    [HttpPost("{id:int}/submit"), Authorize(Roles = "team_member")]
    public async Task<IActionResult> Submit(int id)
    {
        var report = await db.Reports.Include(x => x.Versions).SingleOrDefaultAsync(x => x.Id == id);
        if (report is null) return NotFound(); if (report.UserId != UserId) return Forbid();
        if (report.Status != "Draft") return Conflict(new { message = "Only a draft can be submitted." });
        var now = DateTime.UtcNow; report.Status = "Submitted"; report.SubmittedAt = now; report.UpdatedAt = now; report.Versions.Single(x => x.VersionNumber == report.CurrentVersion).SubmittedAt = now;
        await db.SaveChangesAsync(); return Ok(new { status = report.Status });
    }

    public record ReviewInput(string Action, string? Comment);
    [HttpPost("{id:int}/review"), Authorize(Roles = "manager")]
    public async Task<IActionResult> Review(int id, ReviewInput input)
    {
        var report = await db.Reports.Include(x => x.Versions).SingleOrDefaultAsync(x => x.Id == id); if (report is null) return NotFound();
        if (report.Status != "Submitted") return Conflict(new { message = "Only submitted reports can be reviewed." });
        if (input.Action is not ("Approved" or "Needs Correction")) return BadRequest(new { message = "Action must be Approved or Needs Correction." });
        if (input.Action == "Needs Correction" && string.IsNullOrWhiteSpace(input.Comment)) return BadRequest(new { message = "A correction comment is required." });
        report.Status = input.Action; report.HrReviewComment = input.Comment; report.UpdatedAt = DateTime.UtcNow; if (input.Action == "Approved") report.ApprovedAt = DateTime.UtcNow;
        db.ReportActions.Add(new ReportAction { ReportId = id, ReportVersionId = report.Versions.Any() ? report.Versions.OrderByDescending(x => x.VersionNumber).First().Id : 0, ReviewerId = UserId, Action = input.Action, Comment = input.Comment?.Trim() ?? "" });
        await db.SaveChangesAsync(); return Ok(new { status = report.Status });
    }

    private IQueryable<Report> FullQuery() => db.Reports.AsSplitQuery().Include(x => x.Versions).ThenInclude(x => x.Tasks).Include(x => x.Versions).ThenInclude(x => x.Blockers).Include(x => x.Versions).ThenInclude(x => x.Achievements).Include(x => x.Versions).ThenInclude(x => x.WorkHours).ThenInclude(x => x.TaskType).Include(x => x.Versions).ThenInclude(x => x.Links).Include(x => x.Actions).ThenInclude(x => x.ReportVersion);
    private static string? Validate(ReportInput x) => x.ProjectId <= 0 ? "Project is required." : x.WeekEnd < x.WeekStart ? "Week end must follow week start." : x.TasksCompleted.Count == 0 ? "At least one task is required." : x.TasksCompleted.Any(t => string.IsNullOrWhiteSpace(t.Name) || t.PlannedPercentage is < 0 or > 100 || t.ActualPercentage is < 0 or > 100) ? "Task names and percentages are invalid." : null;
    private static ReportVersion BuildVersion(ReportInput x, int number)
    {
        var v = new ReportVersion { VersionNumber = number, ProjectId = x.ProjectId, WeekStart = x.WeekStart.Date, WeekEnd = x.WeekEnd.Date, NextWeekTasks = x.TasksPlanned, OptionalNotes = x.Notes };
        v.Tasks = x.TasksCompleted.Select(t => new TaskItem { TaskName = t.Name, Priority = t.Priority, PlannedPercentage = t.PlannedPercentage, ActualPercentage = t.ActualPercentage, Status = t.Status, PlannedHours = t.TimePlanned, ActualHours = t.TimeSpent, Deliverable = t.Deliverable, TaskTypeId = 1 }).ToList();
        v.Blockers = x.Blockers.Select(b => new Blocker { Description = b.Description, Severity = b.Severity, IsKeyIssue = b.IsKeyIssue }).ToList();
        v.Achievements = x.Achievements.Select(a => new Achievement { Description = a.Description, IsKeyAchievement = a.IsKeyAchievement }).ToList();
        var hours = new[] { ("Development", x.HoursBreakdown.Development), ("Testing", x.HoursBreakdown.Testing), ("Meetings", x.HoursBreakdown.Meetings), ("Documentation", x.HoursBreakdown.Documentation), ("Planning", x.HoursBreakdown.Planning), ("Other", x.HoursBreakdown.Other) };
        v.WorkHours = hours.Select((h, i) => new WorkHour { TaskTypeId = i + 1, Hours = h.Item2 }).Where(h => h.Hours > 0).ToList();
        if (!string.IsNullOrWhiteSpace(x.Links)) v.Links.Add(new ReportLink { Title = "Report link", Url = x.Links.Trim() });
        return v;
    }
    private static ReportDto ToDto(Report r, bool includeContent = true)
    {
        ReportVersionDto MapVersion(ReportVersion v) => new() { Version = v.VersionNumber, SubmittedAt = v.SubmittedAt?.ToString("O") ?? "", Content = new() { TasksCompleted = v.Tasks.Select(t => new ReportTaskDto { Id=t.Id.ToString(), Name=t.TaskName, Priority=t.Priority, PlannedPercentage=t.PlannedPercentage, ActualPercentage=t.ActualPercentage, Status=t.Status, TimePlanned=t.PlannedHours, TimeSpent=t.ActualHours, Deliverable=t.Deliverable }).ToList(), TasksPlanned=v.NextWeekTasks, Blockers=v.Blockers.Select(b=>new BlockerDto { Id=b.Id.ToString(), Description=b.Description, Severity=b.Severity, IsKeyIssue=b.IsKeyIssue }).ToList(), Achievements=v.Achievements.Select(a=>new AchievementDto { Id=a.Id.ToString(), Description=a.Description, IsKeyAchievement=a.IsKeyAchievement }).ToList(), HoursBreakdown=new HoursBreakdownDto { Development=v.WorkHours.Where(h=>h.TaskType.Name=="Development").Sum(h=>h.Hours), Testing=v.WorkHours.Where(h=>h.TaskType.Name=="Testing").Sum(h=>h.Hours), Meetings=v.WorkHours.Where(h=>h.TaskType.Name=="Meetings").Sum(h=>h.Hours), Documentation=v.WorkHours.Where(h=>h.TaskType.Name=="Documentation").Sum(h=>h.Hours), Planning=v.WorkHours.Where(h=>h.TaskType.Name=="Planning").Sum(h=>h.Hours), Other=v.WorkHours.Where(h=>h.TaskType.Name=="Other").Sum(h=>h.Hours) }, Notes=v.OptionalNotes, Links=string.Join("\n",v.Links.Select(l=>l.Url)) } };
        var versions=includeContent ? r.Versions.OrderByDescending(x=>x.VersionNumber).Select(MapVersion).ToList() : new List<ReportVersionDto>(); var content=versions.FirstOrDefault()?.Content ?? new();
        return new ReportDto { Id=r.Id.ToString(), UserId=r.UserId.ToString(), ProjectId=r.ProjectId.ToString(), WeekStart=r.WeekStart.ToString("yyyy-MM-dd"), WeekEnd=r.WeekEnd.ToString("yyyy-MM-dd"), Status=r.Status, TasksCompleted=content.TasksCompleted, TasksPlanned=content.TasksPlanned, Blockers=content.Blockers, Achievements=content.Achievements, HoursBreakdown=content.HoursBreakdown, Notes=content.Notes, Links=content.Links, Versions=versions, Reviews=r.Actions.OrderByDescending(a=>a.CreatedAt).Select(a=>new ReviewDto { Id=a.Id.ToString(), ReviewerId=a.ReviewerId.ToString(), Version=a.ReportVersion.VersionNumber, Comment=a.Comment, Timestamp=a.CreatedAt.ToString("O"), Status=a.Action }).ToList(), CreatedAt=r.CreatedAt.ToString("O"), UpdatedAt=r.UpdatedAt.ToString("O") };
    }
}

public record ReportInput(int ProjectId, DateTime WeekStart, DateTime WeekEnd, List<TaskInput> TasksCompleted, string TasksPlanned, List<BlockerInput> Blockers, List<AchievementInput> Achievements, HoursInput HoursBreakdown, string Notes, string Links);
public record TaskInput(string Name, string Priority, decimal PlannedPercentage, decimal ActualPercentage, string Status, decimal TimePlanned, decimal TimeSpent, string Deliverable);
public record BlockerInput(string Description, string Severity, bool IsKeyIssue);
public record AchievementInput(string Description, bool IsKeyAchievement);
public record HoursInput(decimal Development, decimal Testing, decimal Meetings, decimal Documentation, decimal Planning, decimal Other);

