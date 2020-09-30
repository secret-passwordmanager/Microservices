using System.Collections.Generic;
using System;
using dotnetapi.Entities;
using System.Linq;

namespace dotnetapi.Services
{
    public interface IJwtMiddlewareService
    {
        public void Create(int userId, string loginId);
        public bool Read(int userId, string loginId);
    }
    public class JwtMiddlewareService : IJwtMiddlewareService
    {
        private DatabaseContext _context;

        public JwtMiddlewareService(DatabaseContext context) 
        {
            _context = context;
        }
        
        public void Create(int userId, string loginId)
        {
            JwtBlacklist jwt = new JwtBlacklist();
            jwt.UserId = userId;
            jwt.LoginId = loginId;
            jwt.TimeBlacklisted = DateTime.Now;
            _context.BlacklistJwts.Add(jwt);
            _context.SaveChanges();
        }
        public bool Read(int userId, string loginId) 
        {
            return (_context.BlacklistJwts.Any(t => t.UserId == userId && t.LoginId == loginId));
        }
    }
}