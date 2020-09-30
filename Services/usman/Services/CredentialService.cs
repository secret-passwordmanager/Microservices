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
        Credential Create(Credential cred, User user, string masterCred, string credVal);
        List<Credential> Read(Credential credential);
        void Update(Credential credential);
        void Delete(Credential credential);
        string Decrypt(Credential cred, User user, string MasterCred);

    }

    public class CredentialService: ICredentialService
    {
        private DatabaseContext _context;

        public CredentialService(DatabaseContext context)
        {
            _context = context;
        }
        public Credential Create(Credential cred, User user, string masterCred, string credVal) 
        {    
            /* Make sure masterCred is not empty */        
            if (string.IsNullOrWhiteSpace(masterCred))
                throw new AppException("MasterCred is required");

            /* Make sure credential hint isn't already in use */
            if (_context.Credentials.Any(c => c.UserId == cred.UserId && c.Hint == cred.Hint)) {
                throw new AppException("This credential hint is already used by another of your credentials");
            }

            MasterCredHelper masterCredHelper = new MasterCredHelper();
            cred = masterCredHelper.EncryptCredential(user, cred, masterCred, credVal);
            
            /* Make sure credential's domain is lowercase */
            cred.Domain = cred.Domain.ToLower();

            /* Save changes and return */
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

        public string Decrypt(Credential cred, User user, string MasterCred)
        {  
           
            var credential = _context.Credentials.FirstOrDefault(c => c.Id == cred.Id);
            Console.WriteLine(credential.Id);
            MasterCredHelper masterCredHelper = new MasterCredHelper();
            return masterCredHelper.DecryptCredential(user, credential, MasterCred);
        }

    }
}