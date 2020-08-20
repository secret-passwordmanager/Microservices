using System.Collections.Generic;
using System;
using dotnetapi.Entities;
using System.Linq;

namespace dotnetapi.Services
{
    public interface IJwtMiddlewareService
    {
        public void Create(string token);
        public bool Read(string token);
    }
    public class JwtMiddlewareService : IJwtMiddlewareService
    {
        private DatabaseContext _context;

        public JwtMiddlewareService(DatabaseContext context) 
        {
            _context = context;
        }
        
        public void Create(string token)
        {
            JwtBlacklist jwt = new JwtBlacklist();
            jwt.RefreshToken = token;
            jwt.TimeBlacklisted = DateTime.Now;
            _context.BlacklistJwts.Add(jwt);
            _context.SaveChanges();
        }
        public bool Read(string token) 
        {
            return (_context.BlacklistJwts.Any(t => t.RefreshToken == token));
        }
    }
}