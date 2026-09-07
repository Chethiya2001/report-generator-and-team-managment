using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskDb.Domain.Entities;
using TaskDb.Infrastructure.Data;

namespace TaskDb.Api.Controllers;
[ApiController, Route("api/projects"), Authorize]
public class ProjectsController(TaskDbContext db) : ControllerBase
{
    [HttpGet] public async Task<IActionResult> List() => Ok(await db.Projects.OrderBy(x=>x.Name).Select(x=>new { id=x.Id.ToString(), x.Name, x.Description, category="Project", status=x.IsActive?"active":"completed", createdAt=x.CreatedAt.ToString("O") }).ToListAsync());
    public record Input(string Name, string Description, string? Category, string? Status);
    [HttpPost, Authorize(Roles="manager")] public async Task<IActionResult> Create(Input x) { if(string.IsNullOrWhiteSpace(x.Name)) return BadRequest(new {message="Name is required."}); if(await db.Projects.AnyAsync(p=>p.Name==x.Name.Trim())) return Conflict(new {message="Project name already exists."}); var p=new Project{Name=x.Name.Trim(),Description=x.Description.Trim(),IsActive=x.Status!="completed"}; db.Add(p); await db.SaveChangesAsync(); return Ok(new{id=p.Id.ToString(),p.Name,p.Description,category=x.Category??"Project",status=p.IsActive?"active":"completed",createdAt=p.CreatedAt.ToString("O")}); }
    [HttpPut("{id:int}"), Authorize(Roles="manager")] public async Task<IActionResult> Update(int id,Input x){var p=await db.Projects.FindAsync(id);if(p is null)return NotFound();p.Name=x.Name.Trim();p.Description=x.Description.Trim();p.IsActive=x.Status!="completed";p.UpdatedAt=DateTime.UtcNow;await db.SaveChangesAsync();return NoContent();}
    [HttpDelete("{id:int}"), Authorize(Roles="manager")] public async Task<IActionResult> Delete(int id){var p=await db.Projects.FindAsync(id);if(p is null)return NotFound();if(await db.Reports.AnyAsync(r=>r.ProjectId==id))return Conflict(new{message="Projects with reports cannot be deleted; mark it completed instead."});db.Remove(p);await db.SaveChangesAsync();return NoContent();}
}
