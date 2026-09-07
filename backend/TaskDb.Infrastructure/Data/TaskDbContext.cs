using Microsoft.EntityFrameworkCore;
using TaskDb.Domain.Entities;

namespace TaskDb.Infrastructure.Data
{
    public class TaskDbContext : DbContext
    {
        public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<UserProject> UserProjects { get; set; } = null!;
        public DbSet<Report> Reports { get; set; } = null!;
        public DbSet<ReportVersion> ReportVersions { get; set; } = null!;
        public DbSet<TaskType> TaskTypes { get; set; } = null!;
        public DbSet<TaskItem> Tasks { get; set; } = null!;
        public DbSet<WorkHour> WorkHours { get; set; } = null!;
        public DbSet<Blocker> Blockers { get; set; } = null!;
        public DbSet<ReportAction> ReportActions { get; set; } = null!;
        public DbSet<Achievement> Achievements { get; set; } = null!;
        public DbSet<ReportLink> ReportLinks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table renaming mapping to match ERD if necessary (usually DbSet names are fine, but ERD uses uppercase snake_case or just plural names)
            modelBuilder.Entity<Role>().ToTable("roles");
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Project>().ToTable("projects");
            modelBuilder.Entity<UserProject>().ToTable("user_projects");
            modelBuilder.Entity<Report>().ToTable("reports");
            modelBuilder.Entity<ReportVersion>().ToTable("report_versions");
            modelBuilder.Entity<TaskType>().ToTable("task_types");
            modelBuilder.Entity<TaskItem>().ToTable("tasks");
            modelBuilder.Entity<WorkHour>().ToTable("work_hours");
            modelBuilder.Entity<Blocker>().ToTable("blockers");
            modelBuilder.Entity<ReportAction>().ToTable("report_actions");
            modelBuilder.Entity<Achievement>().ToTable("achievements");
            modelBuilder.Entity<ReportLink>().ToTable("report_links");

            // User -> Role (Many-to-One)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId);

            // UserProject (Many-to-Many join table)
            modelBuilder.Entity<UserProject>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserProjects)
                .HasForeignKey(up => up.UserId);

            modelBuilder.Entity<UserProject>()
                .HasOne(up => up.Project)
                .WithMany(p => p.UserProjects)
                .HasForeignKey(up => up.ProjectId);

            // Report -> User (Many-to-One)
            modelBuilder.Entity<Report>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reports)
                .HasForeignKey(r => r.UserId);

            // Report -> Project (Many-to-One)
            modelBuilder.Entity<Report>()
                .HasOne(r => r.Project)
                .WithMany(p => p.Reports)
                .HasForeignKey(r => r.ProjectId);

            // ReportVersion -> Report (Many-to-One)
            modelBuilder.Entity<ReportVersion>()
                .HasOne(rv => rv.Report)
                .WithMany(r => r.Versions)
                .HasForeignKey(rv => rv.ReportId);

            // ReportVersion -> Project (Many-to-One)
            modelBuilder.Entity<ReportVersion>()
                .HasOne(rv => rv.Project)
                .WithMany(p => p.ReportVersions)
                .HasForeignKey(rv => rv.ProjectId);

            // TaskItem -> ReportVersion (Many-to-One)
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.ReportVersion)
                .WithMany(rv => rv.Tasks)
                .HasForeignKey(t => t.ReportVersionId);

            // TaskItem -> TaskType (Many-to-One)
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.TaskType)
                .WithMany(tt => tt.Tasks)
                .HasForeignKey(t => t.TaskTypeId);

            // WorkHour -> ReportVersion (Many-to-One)
            modelBuilder.Entity<WorkHour>()
                .HasOne(wh => wh.ReportVersion)
                .WithMany(rv => rv.WorkHours)
                .HasForeignKey(wh => wh.ReportVersionId);

            // WorkHour -> TaskType (Many-to-One)
            modelBuilder.Entity<WorkHour>()
                .HasOne(wh => wh.TaskType)
                .WithMany(tt => tt.WorkHours)
                .HasForeignKey(wh => wh.TaskTypeId);

            // Blocker -> ReportVersion (Many-to-One)
            modelBuilder.Entity<Blocker>()
                .HasOne(b => b.ReportVersion)
                .WithMany(rv => rv.Blockers)
                .HasForeignKey(b => b.ReportVersionId);

            // ReportAction -> Report (Many-to-One)
            modelBuilder.Entity<ReportAction>()
                .HasOne(ra => ra.Report)
                .WithMany(r => r.Actions)
                .HasForeignKey(ra => ra.ReportId);

            modelBuilder.Entity<ReportAction>()
                .HasOne(ra => ra.ReportVersion)
                .WithMany(rv => rv.Actions)
                .HasForeignKey(ra => ra.ReportVersionId)
                .OnDelete(DeleteBehavior.Restrict);

            // ReportAction -> Reviewer(User) (Many-to-One)
            modelBuilder.Entity<ReportAction>()
                .HasOne(ra => ra.Reviewer)
                .WithMany(u => u.ReportActions)
                .HasForeignKey(ra => ra.ReviewerId);

            // Achievement -> ReportVersion (Many-to-One)
            modelBuilder.Entity<Achievement>()
                .HasOne(a => a.ReportVersion)
                .WithMany(rv => rv.Achievements)
                .HasForeignKey(a => a.ReportVersionId);

            // ReportLink -> ReportVersion (Many-to-One)
            modelBuilder.Entity<ReportLink>()
                .HasOne(rl => rl.ReportVersion)
                .WithMany(rv => rv.Links)
                .HasForeignKey(rl => rl.ReportVersionId);
        }
    }
}

