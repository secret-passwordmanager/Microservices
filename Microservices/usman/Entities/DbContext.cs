using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace dotnetapi.Entities
{
    public class DatabaseContext : DbContext
    {
        protected readonly IConfiguration _Configuration;
        public DatabaseContext(IConfiguration configuration)
        {
            _Configuration = configuration;
        }
        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            options.UseSqlServer(_Configuration.GetConnectionString("DefaultConnection"));
        }
        public DbSet<JwtBlacklist> BlacklistJwts { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Credential> Credentials {get; set; }
    }
}