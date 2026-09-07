using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TaskDb.Infrastructure.Data;
public class TaskDbContextFactory : IDesignTimeDbContextFactory<TaskDbContext>
{
    public TaskDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<TaskDbContext>()
            .UseMySql("Server=localhost;Database=taskdb;Uid=taskdb;Pwd=taskdb_password;", new MySqlServerVersion(new Version(8, 4, 0)))
            .Options;
        return new TaskDbContext(options);
    }
}
