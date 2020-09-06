using System;
namespace dotnetapi.Entities
{
    public class JwtBlacklist
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string LoginId { get; set; }
        public DateTime TimeBlacklisted { get; set; }
    }
}