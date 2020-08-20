using System;
namespace dotnetapi.Entities
{
    public class JwtBlacklist
    {
        public int Id { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TimeBlacklisted { get; set; }
    }
}