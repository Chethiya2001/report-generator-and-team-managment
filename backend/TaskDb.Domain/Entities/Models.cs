using System;
using System.Collections.Generic;

namespace TaskDb.Domain.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<User> Users { get; set; } = new List<User>();
    }

    public class User
    {
        public int Id { get; set; }
        public int RoleId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Role Role { get; set; } = null!;
        public ICollection<UserProject> UserProjects { get; set; } = new List<UserProject>();
        public ICollection<Report> Reports { get; set; } = new List<Report>();
        public ICollection<ReportAction> ReportActions { get; set; } = new List<ReportAction>();
    }

    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserProject> UserProjects { get; set; } = new List<UserProject>();
        public ICollection<Report> Reports { get; set; } = new List<Report>();
        public ICollection<ReportVersion> ReportVersions { get; set; } = new List<ReportVersion>();
    }

    public class UserProject
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProjectId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Project Project { get; set; } = null!;
    }

    public class Report
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProjectId { get; set; }
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public string Status { get; set; } = "Draft";
        public string? HrReviewComment { get; set; }
        public int CurrentVersion { get; set; } = 1;
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Project Project { get; set; } = null!;
        public ICollection<ReportVersion> Versions { get; set; } = new List<ReportVersion>();
        public ICollection<ReportAction> Actions { get; set; } = new List<ReportAction>();
    }

    public class ReportVersion
    {
        public int Id { get; set; }
        public int ReportId { get; set; }
        public int VersionNumber { get; set; }
        public DateTime WeekStart { get; set; }
        public DateTime WeekEnd { get; set; }
        public int ProjectId { get; set; }
        public string NextWeekTasks { get; set; } = string.Empty;
        public string OptionalNotes { get; set; } = string.Empty;
        public DateTime? SubmittedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Report Report { get; set; } = null!;
        public Project Project { get; set; } = null!;
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<WorkHour> WorkHours { get; set; } = new List<WorkHour>();
        public ICollection<Blocker> Blockers { get; set; } = new List<Blocker>();
        public ICollection<Achievement> Achievements { get; set; } = new List<Achievement>();
        public ICollection<ReportLink> Links { get; set; } = new List<ReportLink>();
        public ICollection<ReportAction> Actions { get; set; } = new List<ReportAction>();
    }

    public class TaskType
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<WorkHour> WorkHours { get; set; } = new List<WorkHour>();
    }

    public class TaskItem
    {
        public int Id { get; set; }
        public int ReportVersionId { get; set; }
        public string TaskName { get; set; } = null!;
        public string Priority { get; set; } = "Medium";
        public decimal PlannedPercentage { get; set; }
        public decimal ActualPercentage { get; set; }
        public string Status { get; set; } = "Pending";
        public decimal PlannedHours { get; set; }
        public decimal ActualHours { get; set; }
        public string Deliverable { get; set; } = string.Empty;
        public int TaskTypeId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportVersion ReportVersion { get; set; } = null!;
        public TaskType TaskType { get; set; } = null!;
    }

    public class WorkHour
    {
        public int Id { get; set; }
        public int ReportVersionId { get; set; }
        public int TaskTypeId { get; set; }
        public decimal Hours { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportVersion ReportVersion { get; set; } = null!;
        public TaskType TaskType { get; set; } = null!;
    }

    public class Blocker
    {
        public int Id { get; set; }
        public int ReportVersionId { get; set; }
        public string Description { get; set; } = null!;
        public string Severity { get; set; } = "Medium";
        public bool IsKeyIssue { get; set; }
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportVersion ReportVersion { get; set; } = null!;
    }

    public class ReportAction
    {
        public int Id { get; set; }
        public int ReportId { get; set; }
        public int ReportVersionId { get; set; }
        public int ReviewerId { get; set; }
        public string Action { get; set; } = null!;
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Report Report { get; set; } = null!;
        public ReportVersion ReportVersion { get; set; } = null!;
        public User Reviewer { get; set; } = null!;
    }

    public class Achievement
    {
        public int Id { get; set; }
        public int ReportVersionId { get; set; }
        public string Description { get; set; } = null!;
        public bool IsKeyAchievement { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportVersion ReportVersion { get; set; } = null!;
    }

    public class ReportLink
    {
        public int Id { get; set; }
        public int ReportVersionId { get; set; }
        public string Title { get; set; } = null!;
        public string Url { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportVersion ReportVersion { get; set; } = null!;
    }
}



