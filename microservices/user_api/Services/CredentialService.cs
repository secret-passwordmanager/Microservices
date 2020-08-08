using AutoMapper;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Linq;

using dotnetapi.Entities;
using dotnetapi.Helpers;

namespace dotnetapi.Services
{
    public interface ICredentialService
    {
        Credential Create(Credential credential, string masterCred, byte[] masterCredKeyHash, byte[] masterCredSalt, byte[] masterCredIV);
        List<Credential> Read(Credential credential);
        void Update(Credential credential);
        void Delete(Credential credential);
    }

    public class CredentialService: ICredentialService
    {
        private DatabaseContext _context;


        public CredentialService(DatabaseContext context)
        {
            _context = context;
        }

        public Credential Create(Credential cred, string masterCred, byte[] masterCredKeyHash, byte[] masterCredSalt, byte[] masterCredIV) 
        {            
            /* Make sure credential hint isn't already in use */
            if (_context.Credentials.Any(c => c.UserId == cred.UserId && c.Hint == cred.Hint)) {
                throw new AppException("This credential hint is already used by another of your credentials");
            }

            /* Convert masterCred into PKBDF2 */
            byte[] masterPkbdf2 = KeyDerivation.Pbkdf2(
                password: masterCred,
                salt: masterCredSalt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8
            );
            Console.WriteLine("Hash: " + masterPkbdf2);


            /* Decrypt the aes key using hashed masterCred */
            byte[] masterKey;
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = masterPkbdf2;
                aes.IV = masterCredIV;
                
                using (var cryptoTransform = aes.CreateDecryptor()) {
                    masterKey = cryptoTransform.TransformFinalBlock(masterCredKeyHash, 0, masterCredKeyHash.Length);
                    Console.WriteLine("PrivateKey: " + Encoding.Unicode.GetString(masterKey, 0, masterKey.Length));
                }
            }

            /* Encrypt the new credential using the aes key */
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = masterPkbdf2;
                aes.GenerateIV();

                using (var cryptoTransform = aes.CreateEncryptor()) {
                    byte[] credEncrpt = cryptoTransform.TransformFinalBlock(masterKey, 0, masterKey.Length);
                }
            }




            /* Make sure credential's domain is lowercase */
            cred.Domain = cred.Domain.ToLower();

            _context.Credentials.Add(cred);
            _context.SaveChanges();

            return cred;
        }

        public List<Credential>Read(Credential cred)
        {
            var creds = _context.Credentials.Where(c => ( (cred.Domain == null || (c.Domain == cred.Domain || c.Domain == ""))
                                                       && (cred.UserId == c.UserId)
                                                       && (cred.Hint == null   || c.Hint == cred.Hint)
                                                       && (cred.Id == 0        || c.Id == cred.Id)
                                                       && (cred.Type == null   || c.Type == cred.Type)
                                            )).AsEnumerable();
            return creds.ToList();
        }

        public void Update(Credential cred)
        {
            var credential = _context.Credentials.FirstOrDefault(c => c.Id == cred.Id && c.UserId == cred.UserId);
            if (credential == null) {
                throw new AppException("None of your credentials have this Id");
            }

            if (cred.Domain != null) {
                credential.Domain = cred.Domain.ToLower();
            }   
            if (cred.Hint != null) {
                credential.Hint = cred.Hint;
            }
            if (cred.Type != null) {
                credential.Type = cred.Type;
            }
            _context.Credentials.Update(credential);
            _context.SaveChanges();
        }

        public void Delete(Credential cred)
        {
            var credential = _context.Credentials.FirstOrDefault(c => c.Id == cred.Id && c.UserId == cred.UserId );
            if (credential == null) {
                throw new AppException("None of your credentials have this Id");
            }

            _context.Credentials.Remove(credential);
            _context.Credentials.Update(credential);
            _context.SaveChanges();
        }

    }
}