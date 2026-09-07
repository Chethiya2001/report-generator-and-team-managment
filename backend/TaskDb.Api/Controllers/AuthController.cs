using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskDb.Domain;
using TaskDb.Domain.Entities;
using TaskDb.Infrastructure.Data;

namespace TaskDb.Api.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(TaskDbContext db, IConfiguration config) : ControllerBase
{
    public record LoginRequest(string Email, string Password);
    public record RegisterRequest(string FirstName, string LastName, string Email, string Password);

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await db.Users.Include(x => x.Role).Include(x => x.UserProjects)
            .SingleOrDefaultAsync(x => x.Email == request.Email.ToLower());
        if (user is null || !user.IsActive || !PasswordUtility.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });
        return Ok(new { token = CreateToken(user), user = ToDto(user) });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (request.Password.Length < 8) return BadRequest(new { message = "Password must be at least 8 characters." });
        var email = request.Email.Trim().ToLower();
        if (await db.Users.AnyAsync(x => x.Email == email)) return Conflict(new { message = "Email is already registered." });
        var role = await db.Roles.SingleAsync(x => x.Name == "team_member");
        var user = new User { FirstName = request.FirstName.Trim(), LastName = request.LastName.Trim(), Email = email, Role = role, PasswordHash = PasswordUtility.Hash(request.Password) };
        db.Users.Add(user); await db.SaveChangesAsync();
        return Ok(new { token = CreateToken(user), user = ToDto(user) });
    }

    private string CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Email, user.Email), new Claim(ClaimTypes.Role, user.Role.Name) };
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(config["Jwt:Issuer"], config["Jwt:Audience"], claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)));
    }
    private static object ToDto(User u) => new { id = u.Id.ToString(), name = $"{u.FirstName} {u.LastName}", u.Email, role = u.Role.Name, projectId = u.UserProjects.FirstOrDefault()?.ProjectId.ToString(), active = u.IsActive };
}
