using System;
using System.Collections.Generic;

namespace TaskDb.Application.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? ProjectId { get; set; }
        public bool Active { get; set; }
    }

    public class ProjectDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class ReportTaskDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public decimal PlannedPercentage { get; set; }
        public decimal ActualPercentage { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TimePlanned { get; set; }
        public decimal TimeSpent { get; set; }
        public string Deliverable { get; set; } = string.Empty;
    }

    public class BlockerDto
    {
        public string Id { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public bool IsKeyIssue { get; set; }
    }

    public class AchievementDto
    {
        public string Id { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsKeyAchievement { get; set; }
    }

    public class HoursBreakdownDto
    {
        public decimal Development { get; set; }
        public decimal Testing { get; set; }
        public decimal Meetings { get; set; }
        public decimal Documentation { get; set; }
        public decimal Planning { get; set; }
        public decimal Other { get; set; }
    }

    public class ReviewDto
    {
        public string Id { get; set; } = string.Empty;
        public string ReviewerId { get; set; } = string.Empty;
        public int Version { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class ReportVersionDto
    {
        public int Version { get; set; }
        public string SubmittedAt { get; set; } = string.Empty;
        public ReportVersionContentDto Content { get; set; } = new();
    }

    public class ReportVersionContentDto
    {
        public List<ReportTaskDto> TasksCompleted { get; set; } = new();
        public string TasksPlanned { get; set; } = string.Empty;
        public List<BlockerDto> Blockers { get; set; } = new();
        public List<AchievementDto> Achievements { get; set; } = new();
        public HoursBreakdownDto HoursBreakdown { get; set; } = new();
        public string Notes { get; set; } = string.Empty;
        public string Links { get; set; } = string.Empty;
    }

    public class ReportDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string ProjectId { get; set; } = string.Empty;
        public string WeekStart { get; set; } = string.Empty;
        public string WeekEnd { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        public List<ReportTaskDto> TasksCompleted { get; set; } = new();
        public string TasksPlanned { get; set; } = string.Empty;
        public List<BlockerDto> Blockers { get; set; } = new();
        public List<AchievementDto> Achievements { get; set; } = new();
        public HoursBreakdownDto HoursBreakdown { get; set; } = new();
        public string Notes { get; set; } = string.Empty;
        public string Links { get; set; } = string.Empty;
        
        public List<ReviewDto> Reviews { get; set; } = new();
        public List<ReportVersionDto> Versions { get; set; } = new();
        
        public string CreatedAt { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;
    }
}
