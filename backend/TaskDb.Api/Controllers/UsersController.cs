using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskDb.Domain;
using TaskDb.Domain.Entities;
using TaskDb.Infrastructure.Data;

namespace TaskDb.Api.Controllers;
[ApiController, Route("api/users"), Authorize(Roles="manager")]
public class UsersController(TaskDbContext db) : ControllerBase
{
    [HttpGet] public async Task<IActionResult> List()=>Ok(await db.Users.Include(x=>x.Role).Include(x=>x.UserProjects).OrderBy(x=>x.FirstName).Select(x=>new{id=x.Id.ToString(),name=x.FirstName+" "+x.LastName,x.Email,role=x.Role.Name,projectId=x.UserProjects.Select(p=>p.ProjectId.ToString()).FirstOrDefault(),active=x.IsActive}).ToListAsync());
    public record Input(string Name,string Email,string Role,string? ProjectId,string? Password,bool Active=true);
    [HttpPost] public async Task<IActionResult> Create(Input x){if(await db.Users.AnyAsync(u=>u.Email==x.Email.ToLower()))return Conflict(new{message="Email already exists."});var names=x.Name.Trim().Split(' ',2);var role=await db.Roles.SingleOrDefaultAsync(r=>r.Name==x.Role);if(role is null)return BadRequest(new{message="Invalid role."});var u=new User{FirstName=names[0],LastName=names.Length>1?names[1]:"",Email=x.Email.ToLower(),Role=role,PasswordHash=PasswordUtility.Hash(x.Password??"Password123!"),IsActive=x.Active};db.Add(u);await db.SaveChangesAsync();if(int.TryParse(x.ProjectId,out var pid))db.Add(new UserProject{UserId=u.Id,ProjectId=pid});await db.SaveChangesAsync();return Ok(new{id=u.Id.ToString()});}
    [HttpPut("{id:int}")] public async Task<IActionResult> Update(int id,Input x){var u=await db.Users.Include(v=>v.UserProjects).SingleOrDefaultAsync(v=>v.Id==id);if(u is null)return NotFound();var role=await db.Roles.SingleOrDefaultAsync(r=>r.Name==x.Role);if(role is null)return BadRequest();var names=x.Name.Trim().Split(' ',2);u.FirstName=names[0];u.LastName=names.Length>1?names[1]:"";u.Email=x.Email.ToLower();u.Role=role;u.IsActive=x.Active;u.UpdatedAt=DateTime.UtcNow;if(!string.IsNullOrWhiteSpace(x.Password))u.PasswordHash=PasswordUtility.Hash(x.Password);db.UserProjects.RemoveRange(u.UserProjects);if(int.TryParse(x.ProjectId,out var pid))db.Add(new UserProject{UserId=id,ProjectId=pid});await db.SaveChangesAsync();return NoContent();}
    [HttpDelete("{id:int}")] public async Task<IActionResult> Deactivate(int id){var u=await db.Users.FindAsync(id);if(u is null)return NotFound();u.IsActive=false;u.UpdatedAt=DateTime.UtcNow;await db.SaveChangesAsync();return NoContent();}
}
