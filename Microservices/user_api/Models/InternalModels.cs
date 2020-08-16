using System.ComponentModel.DataAnnotations;

namespace dotnetapi.Models.Internal
{
    public class BlacklistJwtModel
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}