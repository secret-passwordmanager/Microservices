const config = require('../../config/config.json');
const http = require('axios');

/**
 * Description. @user holds various functions that allow
 * us to perform certain actions on our user microservice
 * (usman) 
*/
var user = {
   /**
      Description. This function will grab the decrypted
      credential from our user api. 
      @param {object} swap The swap object that still 

      @param {string} jwt
      @return {string} credVal The decrypted
      credential in ASCII form.
      @return {number} -1 if the credential was not
      allowed to be used on this domain, otherwise 
      return 0 on success
   */
   getCredential: async (swap, jwt) => {
      return await http.get(config.services.usman.verifyCredUrl, 
         {
            headers: {
               'Authorization': jwt
            },
            params: {
               'Id': swap.credentialId,
               'Domain': swap.domain
            }
         })
         .then((res) => {
            swap.credVal = res.data.credVal;
         })
         .catch((err) => {
            console.log(err);
            return -1;
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
      @return {number} returns the jwk on success, -1 on error
   */
   getJwk: async () =>  {
      return  http.get(config.services.bouncer.urlJwk)
         .then(resp => {
            return resp.data;
         })
         .catch(err => {
            console.error('Unable to grab jwk, bouncer may be down. Here is the complate error' + err);
            return -1;
         });
   }
};

exports.modules.usman = user;
exports.modules.bouncer = auth;