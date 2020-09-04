/**
 * Description. The 3 objects in this file are all related
 * to generating, reading, and verifying JWT's, JWK's, and
 * refresh tokens
 */
const jose = require('jose');
const crypto = require('crypto');
const config = require('../../config/config.json');

var jwt = {

   /**
    * Description. Generates a jwt for the user
    * @param {number} userId The user's userId
    * @param {number} loginId This device's loginId. Will be a
    * unique number that can be used to identify this device
    * @param {string} role The device's role. Either trusted 
    * or untrusted
    * @return {string} Returns a jwt
    */
   gen: (userId, loginId, role) => {
      if (jwk.get() == null)
         throw new Error('JWK is null. Check why it has not yet been grabbed');

      return jose.JWT.sign({
         /* payload */
         'unique_name': userId.toString(),
         'loginId': loginId,
         'role': role
      }, jwk.get(), {
         /* signOpts */
         algorithm: config.auth.alg,
         audience: config.auth.issuer,
         expiresIn: config.auth.expiresIn,
         iat: config.auth.iat,
         issuer: config.auth.issuer,
         subject: userId.toString(),  
      });
   }
};

var jwk = {
   
   /**
    * @val is the JWK itself
    */
   val: null,

   /**
    * Description. Generates a JWK based on the parameters
    * specified in config.json.auth
    * @return {object} Returns a JWK; throws an error if 
    * something went wrong so maybe use a try catch block
    */
   gen: () => {
      return jose.JWK.generateSync(config.auth.keyType, 2048, {
         alg: config.auth.alg,
         use: 'sig'
      });
   },

   /**
    * Description. Returns the JWK to be used for generating
    * JWT's
    * @return {object} Returns the JWK
    * @return {null} If the JWK for some reason has not yet
    * been created 
    */
   get: () => {
      if (this.val == null) {
         this.gen();
      }
      return this.val;
   }
};

var refreshToken = {

   /**
    * Description. Generates a string intended to be used as the
    * value that will be returned to the user
    * @return {string} Returns a string encoded in hex with length
    * of 128 that contains 32 bytes of random bytes (1 byte = 2 chars
    * in hex)
    */
   genVal: () => {
      return crypto.randomBytes(64).toString('hex');
   },

   /**
    * Description. Generates a string intended to be used as the 
    * loginId for a refreshToken
    * @return {string} Returns a string encoded in hex with length
    * of 32 that contains 16 bytes of random bytes (1 byte = 2 chars
    * in hex)
    */
   genLoginId: () => {
      return crypto.randomBytes(16).toString('hex');
   }
};

module.exports.jwt = jwt;
module.exports.jwk = jwk;
module.exports.refreshToken = refreshToken;