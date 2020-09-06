using System.ComponentModel.DataAnnotations;

namespace dotnetapi.Models.Internal
{
    public class BlacklistJwtModel
    {
        [Required]
        public string LoginId { get; set; }
        public int UserId { get; set; }
    }
}