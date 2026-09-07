using TaskDb.Domain;
using TaskDb.Domain.Entities;

namespace TaskDb.Infrastructure.Data;
public static class DbInitializer
{
    public static void Initialize(TaskDbContext context)
    {
        if (context.Users.Any()) return;
        var managerRole=new Role{Name="manager",Description="Manager / administrator"};var memberRole=new Role{Name="team_member",Description="Team member"};context.AddRange(managerRole,memberRole);context.SaveChanges();
        var users=new[]{
            new User{Role=managerRole,FirstName="John",LastName="Smith",Email="manager@demo.com",PasswordHash=PasswordUtility.Hash("Password123!")},
            new User{Role=memberRole,FirstName="Alex",LastName="Johnson",Email="alex@demo.com",PasswordHash=PasswordUtility.Hash("Password123!")},
            new User{Role=memberRole,FirstName="Sarah",LastName="Wilson",Email="sarah@demo.com",PasswordHash=PasswordUtility.Hash("Password123!")},
            new User{Role=memberRole,FirstName="Maya",LastName="Patel",Email="maya@demo.com",PasswordHash=PasswordUtility.Hash("Password123!")},
            new User{Role=memberRole,FirstName="Daniel",LastName="Lee",Email="daniel@demo.com",PasswordHash=PasswordUtility.Hash("Password123!")}};context.AddRange(users);context.SaveChanges();
        var projects=new[]{new Project{Name="Client Portal",Description="Customer self-service portal"},new Project{Name="Internal Tooling",Description="Internal productivity tools"},new Project{Name="R&D",Description="Research and experiments"}};context.AddRange(projects);context.SaveChanges();
        var types=new[]{"Development","Testing","Meetings","Documentation","Planning","Other"}.Select(n=>new TaskType{Name=n,Description=n+" work"}).ToArray();context.AddRange(types);context.SaveChanges();
        foreach(var user in users.Skip(1))context.Add(new UserProject{UserId=user.Id,ProjectId=projects[(user.Id-2)%projects.Length].Id});context.SaveChanges();
        var monday=DateTime.UtcNow.Date.AddDays(-(((int)DateTime.UtcNow.DayOfWeek+6)%7));var statuses=new[]{"Submitted","Approved","Needs Correction","Draft"};
        for(var person=1;person<users.Length;person++)for(var week=0;week<3;week++){
            var status=statuses[(person+week)%statuses.Length];var report=new Report{UserId=users[person].Id,ProjectId=projects[(person-1)%projects.Length].Id,WeekStart=monday.AddDays(-7*week),WeekEnd=monday.AddDays(-7*week+6),Status=status,CurrentVersion=1,SubmittedAt=status=="Draft"?null:DateTime.UtcNow.AddDays(-7*week),ApprovedAt=status=="Approved"?DateTime.UtcNow.AddDays(-7*week):null,HrReviewComment=status=="Needs Correction"?"Please add the missing deliverable and clarify the blocker.":null};var version=new ReportVersion{VersionNumber=1,ProjectId=report.ProjectId,WeekStart=report.WeekStart,WeekEnd=report.WeekEnd,NextWeekTasks="Complete the next milestone and add automated tests.",OptionalNotes="Seeded report for dashboard demonstration.",SubmittedAt=report.SubmittedAt};version.Tasks.Add(new TaskItem{TaskTypeId=types[0].Id,TaskName="Deliver weekly project milestone",Priority="High",PlannedPercentage=100,ActualPercentage=status=="Draft"?60:100,Status=status=="Draft"?"In Progress":"Completed",PlannedHours=20,ActualHours=18,Deliverable="https://example.com/deliverable"});version.WorkHours.Add(new WorkHour{TaskTypeId=types[0].Id,Hours=18});version.WorkHours.Add(new WorkHour{TaskTypeId=types[2].Id,Hours=4});version.Achievements.Add(new Achievement{Description="Completed the milestone on schedule",IsKeyAchievement=true});if((person+week)%2==0)version.Blockers.Add(new Blocker{Description="Waiting for stakeholder feedback",Severity="Medium",IsKeyIssue=true});report.Versions.Add(version);context.Add(report);
        }context.SaveChanges();
        foreach(var report in context.Reports.Where(r=>r.Status=="Needs Correction").ToList()){var version=context.ReportVersions.Single(v=>v.ReportId==report.Id&&v.VersionNumber==report.CurrentVersion);context.Add(new ReportAction{ReportId=report.Id,ReportVersionId=version.Id,ReviewerId=users[0].Id,Action="Needs Correction",Comment=report.HrReviewComment!});}context.SaveChanges();
    }
}
