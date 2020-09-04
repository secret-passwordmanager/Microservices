//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////

const config = require('../../config/config.json');
const http = require('axios');
//////////////////////////////////////////////
/////////// Microservice Functions ///////////
//////////////////////////////////////////////
/**
 * Description. A webhook that lets all other 
 */
var global = {
   /**
    * 
    */
   logOut: async () => {

   }
};

/**
 * Description. @user holds various functions that allow
 * us to perform certain actions on our user microservice
 * (usman) 
*/
var user = {

   /**
    * Description. This function grabs the userId
    * @param {string} username The user's username
    * @param {string} password The user's password
    * @return {number} Returns the user's userId
    * @return {Error} Returns an error object if the
    * response was not 200
    */
   getUserId: async (username, password) => {

      if (typeof username != 'string') {
         throw new Error('Username must be a string');
      }
      if (typeof password != 'string') {
         throw new Error('Password must be a string');
      }
      return http.post(config.services.usman.urls.userVerify, 
         {
            'username': username,
            'password': password  
         })
         .then((res) => {
            console.log(res.data.id);
            return res.data.id;
         })
         .catch((err) => {
            return new Error('Error, failed to verify user through usman. Here is the full error: ' + err.message);
         });
   },

   masterCredVerify: async (userId, masterCred) => {

      if (typeof userId != 'number') {
         throw new Error('userId must be a number');
      }
      if (typeof masterCred != 'string') {
         throw new Error('masterCred must be a string');
      }
      return http.post(config.services.usman.urls.masterCredVerify, 
         {
            'UserId': userId,
            'masterCred': masterCred
         })
         .then((res) => {
            if (res.data.length == 0) {
               return;
            } else {
               return new Error('Error, failed to verify masterCred through usman.');
            }
         })
         .catch((err) => {
            return new Error('Error, failed to verify masterCred through usman. Here is the full error: ' + err.message);
         });

   },

   /**
    * Description. This function can verify if the credential
    * that is represented in @swap.credId can be used by the
    * domain, @swap.domain
    * @param {object} swap This object contains information
    * pertaining to the swap
    * @param {string} jwt This is the user's jwt, which
    * we will use to authorize our request
    * @return {number} returns 0 on success
    * @return {Error} returns an Error object if the response
    * was not 200
    */
   credVerify: async (swap, jwt) => {
      return http.get(config.services.usman.urls.credVerify, 
         {
            headers: {
               'Authorization': 'Bearer ' + jwt
            },
            params: {
               'Id': swap.credentialId,
               'Domain': swap.domain
            }
         })
         .then((res) => {
            /* This means that the credential could not be used */
            if (res.data.length == 0) 
               return new Error (res);
            
            return 0;

         })
         .catch((err) => {
            return new Error('Error, failed to connect to usman. Here is the full error: ' + err.message);
         });
   },

   /**
    * Description. This function can verify if the credential
    * that is represented in @swap.credId can be used by the
    * domain, @swap.domain
    * @param {object} swap This object contains information
    * pertaining to the swap
    * @param {string} jwt This is the user's jwt, which
    * we will use to authorize our request
    * @param {string} masterCred This is the user's masterCred,
    * which we need to use to decrypt the credential
    * @return {number} return 0 on success
    * @return {Error} return Error object if response was not
    * 200
    */
   credDecrypt: async (swap, jwt, masterCred) => { //TODO: Get mastercred from jwt once we implement the new role types
      return http.get(config.services.usman.urls.credDecrypt, 
         {
            headers: {
               'Authorization': 'Bearer ' + jwt
            },
            params: {
               'Id': swap.credId,
               'MasterCred': masterCred
            }
         })
         .then((res) => {
            swap.credVal = res.data.credVal;
            return 0;
         })
         .catch((err) => {
            return new Error('Error, failed decrypt a credential. Here is the full error: ' + err.response);
         });
   }
};

/**
 * Description. @auth holds various functions that allow
 * us to perform certain actions to our authorization
 * microservice (bouncer)
 */
var auth = {

   /**
      Description. This function grabs the jwk from bouncer,
      whose url is defined in our config file. 
      @return {object} returns the jwk on success
      @return {Error} returns an error if response was not 200
   */
   getJwk: async () =>  {
      return  http.get(config.services.bouncer.urlJwk)
         .then(resp => {
            return resp.data;
         })
         .catch(err => {
            return new Error('Unable to grab jwk, bouncer may be down. Here is the complete error' + err.response);
         });
   }
};

module.exports.usman = user;
module.exports.bouncer = auth;
module.exports.global = global;