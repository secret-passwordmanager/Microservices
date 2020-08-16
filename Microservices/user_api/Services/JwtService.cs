using System.Collections.Generic;
using System;
using dotnetapi.Entities;
using System.Linq;

namespace dotnetapi.Services
{
    public interface IJwtService
    {
        void Create(string refreshToken);
        bool Read(string refreshToken);
        bool Delete(string refreshtoken);
    }

    public class JwtService: IJwtService
    {
        private DatabaseContext _context;

        public JwtService(DatabaseContext context) 
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
        public bool Delete(string token)
        {
            return false;
        }
    }
}