using System;
using System.Linq;

using dotnetapi.Entities;
using dotnetapi.Helpers;
using dotnetapi.Models.Users;

namespace dotnetapi.Services
{
    public interface IUserService
    {
        void Create(User model, string password, string masterCred, string Role);
        User Read(int id);
        void Update(User model, string password);
        void Delete(int id);
        int Verify(UserVerifyModel model);
        bool VerifyMasterCred(UserVerifyMasterCredModel model);
    }

    public class UserService : IUserService
    {
        private DatabaseContext _context;
       

        public UserService(DatabaseContext context)
        {
            _context = context;
        }
        public void Create(User user, string password, string masterCred, string role)
        {
            /* Make sure that password is not empty */
            if (string.IsNullOrWhiteSpace(password))
                throw new AppException("Password is required");

            /* Make sure masterCred is not empty */
            if (string.IsNullOrWhiteSpace(masterCred))
                throw new AppException("MasterCred is required");

            /* Make sure that username is not taken */
            if (_context.Users.Any(x => x.Username == user.Username))
                throw new AppException("Username \"" + user.Username + "\" is already taken");

            /* Hash the password */
            byte[] passwordHash, passwordSalt;
            CreatePasswordHash(password, out passwordHash, out passwordSalt);
            user.Role = role;
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;

            /* Encrypt the master cred  */
            MasterCredHelper masterCredHelper = new MasterCredHelper();
            masterCredHelper.CreateUserMasterCred(user, masterCred);
           
            /* Save changes in the database and return */
            _context.Users.Add(user);
            _context.SaveChanges();
            return;
        }

        public User Read(int id)
        {
            return _context.Users.Find(id);
        }

        public void Update(User newUser, string password)
        {
            var user = _context.Users.Find(newUser.Id);
            if (user == null)
                throw new AppException("User not found");

            // update username if it has changed
            if (!string.IsNullOrWhiteSpace(newUser.Username) && newUser.Username != user.Username)
            {
                // throw error if the new username is already taken
                if (_context.Users.Any(x => x.Username == newUser.Username)) {
                    throw new AppException("Username " + newUser.Username + " is already taken");
                }
                user.Username = newUser.Username;
            }

            // update user properties if provided
            if (!string.IsNullOrWhiteSpace(newUser.FirstName))
                user.FirstName = newUser.FirstName;

            if (!string.IsNullOrWhiteSpace(newUser.LastName))
                user.LastName = newUser.LastName;

            // update password if provided
            if (!string.IsNullOrWhiteSpace(password))
            {
                byte[] passwordHash, passwordSalt;
                CreatePasswordHash(password, out passwordHash, out passwordSalt);

                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
            }
            _context.Users.Update(user);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
        }

        public int Verify(UserVerifyModel model)
        {
            var user = _context.Users.SingleOrDefault(x => x.Username == model.Username);   
            if (user == null)
                throw new AppException("Username not found");
            // check if password is correct
            try {
                if (!VerifyPasswordHash(model.Password, user.PasswordHash, user.PasswordSalt))
                    throw new AppException("Invalid password");
            }
            catch (ArgumentException) {
                throw new AppException("Issue parsing password");
            }
            
            MasterCredHelper masterCredHelper = new MasterCredHelper();
            if (model.MasterCred != null) {
                if (!masterCredHelper.VerifyMasterCred(user, model.MasterCred)) {
                    throw new AppException("Invalid master credential");
                }
            }
            return user.Id;
        }
      public bool VerifyMasterCred(UserVerifyMasterCredModel model)
      {
         var user = _context.Users.SingleOrDefault(x => x.Id == model.Id);   
            if (user == null)
                throw new AppException("Username not found");

         MasterCredHelper masterCredHelper = new MasterCredHelper();

         if (!masterCredHelper.VerifyMasterCred(user, model.MasterCred)) {
            throw new AppException("Invalid master credential");
         }
         return true;  
         
      }
        ////////////////////////////////////////////////////////////////////////////////
        //////////////////////// Private Helper Functions //////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////
        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            if (password == null) 
                throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) 
                throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");

            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        private static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            if (string.IsNullOrWhiteSpace(password)) 
                throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");
            if (storedHash.Length != 64) 
                throw new ArgumentException("Invalid length of password hash (64 bytes expected).", "passwordHash");
            if (storedSalt.Length != 128) 
                throw new ArgumentException("Invalid length of password salt (128 bytes expected).", "passwordHash");

            using (var hmac = new System.Security.Cryptography.HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != storedHash[i]) return false;
                }
            }
            return true;
        }
    }
}