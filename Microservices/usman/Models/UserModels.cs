using System.ComponentModel.DataAnnotations;

namespace dotnetapi.Models.Users
{
    public class UserVerifyModel
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
        public string MasterCred { get; set; }
    }
   public class UserVerifyMasterCredModel //TODO organize better with userVerifyModel
   {
      [Required]
      public string MasterCred { get; set; }
      [Required]
      public int Id { get; set; }
   }
    public class UserCreateModel
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string MasterCred { get; set; }
    }
    public class UserReadModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
    }
    public class UserUpdateModel
    {
        public int? Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}