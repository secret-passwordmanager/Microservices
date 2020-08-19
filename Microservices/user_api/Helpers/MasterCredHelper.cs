using dotnetapi.Entities;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Text;

namespace dotnetapi.Services
{
    public class MasterCredHelper
    {
        public User CreateUserMasterCred(User user, string masterCred)
        {
            /* Make some salt */
            byte[] masterSalt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(masterSalt);
            user.MasterCredSalt = masterSalt;

            /* Hash masterCred using PBKDF2 */
            byte[] masterPkbdf2 = HashMasterCred(masterCred, user.MasterCredSalt);

             /* Generate AES key randomly */
            byte[] masterKey = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
                rng.GetBytes(masterKey);

            /* Encrypt AES key using masterPkdf2 as the key */
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = masterPkbdf2;
                aes.GenerateIV();

                using (var cryptoTransform = aes.CreateEncryptor()) {
                    user.MasterCredIV = aes.IV;
                    user.MasterKeyAesEnc = cryptoTransform.TransformFinalBlock(masterKey, 0, masterKey.Length);
                }
            }
            return user;
        }
        
        public Credential EncryptCredential(User user, Credential cred, string masterCred, string credVal)
        {
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = DecryptMasterKey(user, masterCred);
                System.Console.Write(Encoding.ASCII.GetString(aes.Key, 0, aes.Key.Length));
                aes.GenerateIV();

                using (var cryptoTransform = aes.CreateEncryptor()) {
                    byte[] credEncrypt = cryptoTransform.TransformFinalBlock(Encoding.ASCII.GetBytes(credVal), 0, Encoding.ASCII.GetBytes(credVal).Length);

                    /* Save values to the credential */
                    cred.AesIV = aes.IV;
                    cred.AesValue = credEncrypt;
                }
            }
            return cred;
        }
        public bool VerifyMasterCred(User user, string masterCred) 
        {
            try {
                DecryptMasterKey(user, masterCred);
                return true;
            } 
            catch (System.Security.Cryptography.CryptographicException) {
                System.Console.WriteLine("Error, wrong key used");
                return false;
            }
        }

        private byte[] HashMasterCred(string masterCred, byte[] salt)
        {
            /* Hash masterCred using PBKDF2 */
            return KeyDerivation.Pbkdf2(
                password: masterCred,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA1,
                iterationCount: 10000,
                numBytesRequested: 256 / 8
            );
        }
        private byte[] DecryptMasterKey(User user, string masterCred)
        {
            byte[] masterKey;
            using (var aes = Aes.Create()) {
                aes.Mode = CipherMode.CBC;
                aes.Key = HashMasterCred(masterCred, user.MasterCredSalt);
                aes.IV = user.MasterCredIV;
                
                using (var cryptoTransform = aes.CreateDecryptor()) {
                    masterKey = cryptoTransform.TransformFinalBlock(user.MasterKeyAesEnc, 0, user.MasterKeyAesEnc.Length);
                }
            }
            System.Console.Write(Encoding.ASCII.GetString(masterKey, 0, masterKey.Length));
            return masterKey;
        }
    }
}