
using Microsoft.Extensions.Options;
using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Collections.Generic;
using System.Linq;

using dotnetapi.Entities;
using dotnetapi.Helpers;
using dotnetapi.Models.Users;

namespace dotnetapi.Services
{
    public interface IUserService
    {
        User Authenticate(UserAuthenticateModel model);
        IEnumerable<User> ReadAll();
        void Create(User model, string password, string masterCred, string Role);
        User Read(int id);
        void Update(User model, string password);
        void Delete(int id);
    }

    public class UserService : IUserService
    {
        private DatabaseContext _context;
       
        private readonly AppSettings _appSettings;

        public UserService(DatabaseContext context, IOptions<AppSettings> appSettings)
        {
            _context = context;
            _appSettings = appSettings.Value;
        }

        public User Authenticate(UserAuthenticateModel model)
        {
            var user = _context.Users.SingleOrDefault(x => x.Username == model.Username);   
            if (user == null)
                return null;
            // check if password is correct
            if (!VerifyPasswordHash(model.Password, user.PasswordHash, user.PasswordSalt))
                return null;

            return user;
        }

        public void Create(User user, string password, string masterCred, string role)
        {
            /* Make sure that password is not empty */
            if (string.IsNullOrWhiteSpace(password))
                throw new AppException("Password is required");

            /* Make sure that username is not taken */
            if (_context.Users.Any(x => x.Username == user.Username))
                throw new AppException("Username \"" + user.Username + "\" is already taken");


            /* Hash the password */
            byte[] passwordHash, passwordSalt;
            CreatePasswordHash(password, out passwordHash, out passwordSalt);
            user.Role = role;
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;

            /*
            // Generating public and private key for credential encryption
            var cryptoServiceProvider = new RSACryptoServiceProvider(2048);
            var privateKey = cryptoServiceProvider.ExportParameters(true); 
            var publicKey = cryptoServiceProvider.ExportParameters(false); 

            string publicKeyString = GetKeyString(publicKey);
            string privateKeyString = GetKeyString(privateKey);

            user.PublicCredKey = publicKeyString;



            return privateKeyString; */

            /* Generate AES key randomly */
            byte[] masterKey = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(masterKey);


            /* Hash the password using PKBDF2 so that it can 
            be used as the key to encrypt the private key */
            byte[] masterSalt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(masterSalt);

            Console.WriteLine("Salt: " + Convert.ToBase64String(masterSalt) + "\n");

            byte[] masterPkbdf2 = KeyDerivation.Pbkdf2(
                password: masterCred,
                salt: masterSalt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8
            );
            Console.WriteLine("Hash: " + masterPkbdf2);


            /* Encrypt the private key with AES using masterPkbdf2 as the key */
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = masterPkbdf2;
                aes.GenerateIV();

                using (var cryptoTransform = aes.CreateEncryptor()) {
                    user.MasterCredIV = aes.IV;
                    user.MasterCredKeyHash = cryptoTransform.TransformFinalBlock(masterKey, 0, masterKey.Length);
                }
            }

            /* Save changes in the database and return */
            _context.Users.Add(user);
            _context.SaveChanges();
            return;
        }

        public IEnumerable<User> ReadAll()
        {
            return _context.Users;
        }

        public User Read(int id)
        {
            return _context.Users.Find(id);
        }

        public void Update(User model, string password)
        {
            var user = _context.Users.Find(model.Id);
            if (user == null)
                throw new AppException("User not found");

            // update username if it has changed
            if (!string.IsNullOrWhiteSpace(model.Username) && model.Username != user.Username)
            {
                // throw error if the new username is already taken
                if (_context.Users.Any(x => x.Username == model.Username)) {
                    throw new AppException("Username " + model.Username + " is already taken");
                }
                user.Username = model.Username;
            }

            // update user properties if provided
            if (!string.IsNullOrWhiteSpace(model.FirstName))
                user.FirstName = model.FirstName;

            if (!string.IsNullOrWhiteSpace(model.LastName))
                user.LastName = model.LastName;

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

        ////////////////////////////////////////////////////////////////////////////////
        //////////////////////// Private Helper Functions //////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////
        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            if (password == null) throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");

            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        private static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            if (password == null) throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");
            if (storedHash.Length != 64) throw new ArgumentException("Invalid length of password hash (64 bytes expected).", "passwordHash");
            if (storedSalt.Length != 128) throw new ArgumentException("Invalid length of password salt (128 bytes expected).", "passwordHash");

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

        private static string GetKeyString(RSAParameters publicKey)
        {
            var stringWriter = new System.IO.StringWriter();
            var xmlSerializer = new System.Xml.Serialization.XmlSerializer(typeof(RSAParameters));
            xmlSerializer.Serialize(stringWriter, publicKey);
            return stringWriter.ToString();
        }
    }
}