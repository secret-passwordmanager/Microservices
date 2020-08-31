const crypto = require('crypto');
const config = require('../../config/config.json');
var http = require('axios');
/**
   Description. This function will make several 
   requests to usman (our user microservice) 
   using the user's jwt as authorization. These
   are the requests, and what they will do
   1. Verify that the credential is authorized
      to be used on this domain
   2. Grab the encrypted credential
   3. Grab the encrypted private key (then
      decrypt it using the master cred)
   
   Afterwards, decrypt the credential with the
   decrypted private key. Return the value of 
   the credential
   @param {object} swap The swap object that still 
   needs to have 
   @param {string} jwt
   @return {string} credVal The decrypted
   credential in ASCII form.
   @return {number} -1 if the credential was not
   allowed to be used on this domain, otherwise 
   return 0 on success
*/
async function getCredential(swap, jwt) {
   return await http.get(config.services.usman.verifyCredUrl, 
      {
         headers: {
            'Authorization': jwt
         },
         params: {
            'Id': swap.credentialId,
            'Domain': swap.domain
         }
      }
   )
      .then((res) => {
         return 0;
      })
      .catch((err) => {
         console.log(err);
         return -1;
      });

   return 'c0cac0la';
}
async function getMasterCredInfo(jwt) {

   await http.get(config.services.usman.masterInfoUrl, {
      headers: {
         'Authorization': jwt
      },
   })
      .then(res => {
         return {
            masterKeyEnc: res.masterKeyAesEnc,
            masterCredSalt: res.masterCredSalt,
            masterKeyIv: res.masterCredIV
         };
      })
      .catch(err => {
         console.log(err);
         return -1;
      });
}


function hashMasterCred(masterCred, salt, numIter) {


   crypto.pbkdf2(masterCred, salt, numIter, 32, 'sha1', (err, derivedKey) => {
      if (err) 
         throw err;

      console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
   });

} 

function decryptMasterKey(masterKeyEnc, masterKeyIV, masterCredHash) {

   return ((masterKeyEnc) => {
      let decipher = crypto.createDecipheriv('aes-256-cbc', masterCredHash, masterKeyIV);
      let decrypted = decipher.update(masterKeyEnc, 'base64', 'utf8');
      return (decrypted + decipher.final('ascii'));
   });
}


async function tmp(swap, jwt) {

   let credEnc = await getCredential(swap, jwt);
   let masterInfo = await getMasterCredInfo(jwt);


}

module.exports.getCredential = tmp;