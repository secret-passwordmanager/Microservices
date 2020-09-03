//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
/*global io */

const jose = require('jose');
const bouncer = require('./services').bouncer;

/**
* @param {object} jwk : Global JWK that is used to validate 
* all requests.
*/
var jwk = null;
//////////////////////////////////////////////
/////////// Middleware Functions /////////////
//////////////////////////////////////////////

/**
   Description. @middleware holds 3 socket.io middleware
   functions, each to be used to verify one of our 
   custom socket.io namespaces.
   @param {object} socket Has information about the incoming
   connection
   @param {function} next The next function to run in the
   socket.io middleware chain
   @return {function}: If there are no errors, it will call the next
   function, @next. 
   @return {Error} If there are errors, an error will be returned

   */

var middleware = {
   trusted: async (socket, next) => {
      /* Grab jwt */
      let jwt = socket.handshake.query.jwt;
      if(jwt == undefined) {
         let error = 'Client does not have appear to have any jwt in socket.handshake.query';
         console.log(error);
         return new Error(error);
      }
      /* Grab masterCred */
      if (socket.handshake.query.masterCred == undefined) {
         let error = 'No masterCred was specified in handshake query';
         console.log(error);
         return new Error(error);
      }
      /* Verify jwt */
      if (await verifyJwt(jwt, 'Trusted') instanceof Error) {
         let error = 'Client jwt cannot be verified';
         console.log(error);
         return new Error(error);
      }
      
      /* Refuse to connect if there is no mitm client */
      if(io.of('Mitm').adapter.rooms.Mitm == undefined) {
         let error = 'There is no mitm client connected. Cannot connect clients until mitm has connected';
         console.log(error);
         return new Error(error);
      }

      return next();
   },

   untrusted: async (socket, next) => {
      /* Grab jwt */
      let jwt = socket.handshake.query.jwt;
      if(jwt == undefined) {
         let error = 'Client does not have appear to have any jwt in socket.handshake.query';
         console.log(error);
         return new Error(error);
      }
      if (await verifyJwt(jwt, 'Untrusted') instanceof Error) {
         let error = 'Client jwt cannot be verified';
         console.log(error);
         return new Error(error);
      }

      /* Refuse to connect if there is no mitm client */
      if(io.of('Mitm').adapter.rooms.Mitm == undefined) {
         let error = 'There is no mitm client connected. Cannot connect clients until mitm has connected';
         console.log(error);
         return new Error(error);
      }
      
      return next();
   },

   mitm: async (socket, next) => {
      
      /* Refuse to connect if there is already an existing client */
      if(io.of('Mitm').adapter.rooms.Mitm != undefined) {
         let error = ('There is already a mitm client connected. Only one mitm client can connect at a time');
         console.error(error);
         return new Error(error);
      }

      return next();
   }
};

/**
 * Description. Given a jwt and a user role, it will use 
 * the JWK to authenticate the user
 * @param {string} jwt The user's jwt
 * @param {string} role The role to check against
 * @return {number} Returns 0 on success
 * @return {Error} If this is returned, there were errors
 */
async function verifyJwt(jwt, role) {
   /* If the jwk was not grabbed yet */
   if (jwk === null) {
      jwk = await bouncer.getJwk();
   }

   /* Verify the jwt */
   let auth;
   try {
      auth = await jose.JWT.verify(jwt, jwk);
   } catch (err) {
      return new Error('This jwt could not be verified. Please make sure it is valid');
   }
   
   /* Make sure that the role is an accepted role */
   if (auth.role != role) {
      console.log('This JWT does not have the correct permissions');
      return new Error('Improper permissions. ' + auth.role + 'is not allowed on this namespace');
   }
   return 0;
}

/**
   Description. this function returns the user's userId
   based on the jwt. 
   @param {string} jwt The user's jwt
   @return {number} The user's userId
*/
function getUserId(jwt) {
   return jose.JWT.decode(jwt, {complete: false}).unique_name;
}

/**
 * Description. This function decodes the user's masterCred
 * from the jwt
 * @param {string} jwt The user's jwt, found by doing
 * socket.handshake.query.jwt
 */
function getUserMasterCred(jwt) {
   return jose.JWT.decode(jwt, {complete: false}).masterCred;
}
//////////////////////////////////////////////
//////////// Exported Functions //////////////
//////////////////////////////////////////////

module.exports.middleware = middleware;
module.exports.getUserId = getUserId;
module.exports.getUserMasterCred = getUserMasterCred;
