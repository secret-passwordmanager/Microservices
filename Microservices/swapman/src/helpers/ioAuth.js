//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const jose = require('jose');
const bouncer = require('./services').bouncer;

/* 
   @jwk: Global JWK that is used to validate all 
   requests 
*/
var jwk = null;

//////////////////////////////////////////////
/////////// Middleware Functions /////////////
//////////////////////////////////////////////

/*
   Description. Validates the
    jwt, and closes 
   the connection if it
   is invalid. This function is never directly
   used, rather 3 seperate functions act as a 
   wrapper for each of our namespaces
   @socket: default arg for socketio middleware
   @next: default arg for socketio middleware
   @roles: Array of roles that are authorized.
   I.e. Each jwt made by our auth server has a
   payload variable called "role". The jwt will
   be authorized only if it's role matches one
   of the roles in the @roles array
   @return: If there are no errors, it will
   return next() which will pass the next 
   socketio middleware through.
*/
 async function middleware(socket, next, roles) {
   try {
      console.log('in ioAuth');
      /* If the jwk was not grabbed yet */
      if (jwk === null) {
         jwk = await bouncer.getJwk();
      }

      /* Abort connection if there was a problem grabbing jwk */
      if (jwk === -1){
         throw 'There was an issue grabbing the jwk'; 
      }

      // /* Grab the jwt from the handshake */f TODO: Add back later
      // let jwt = socket.handshake.query.jwt;
      // if (jwt === undefined) {
      //    throw new Error('The request contains an invalid jwt');
      // }
      
      // /* Verify the jwt */
      // let auth = jose.JWT.verify(jwt, jwk);

      // /* Make sure that the role is an accepted role */
      // if (!roles.includes(auth.role)) {
      //    throw new Error('This JWT does not have the correct permissions');
      // }
   }
   /* If there is an error, disconnect and don't call next() */
   catch(err) {
      console.error(err);
      socket.disconnect();
      return;
   }

   /* If no errors, call next() as normal */
   return next();
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

/**
   Description. These functions are wrappers over the 
   middleware function that allow us to define the roles 
   for each of our namespaces
   @param {object} socket Required for socket.io middleware
   @param {function} next The next function to run in the
   socket.io middleware chain
   @return: void
*/
function middlewareTrusted(socket, next) {
   middleware(socket, next, ['Trusted', 'Untrusted']);
}
function middlewareUntrusted(socket, next) {
   middleware(socket, next, ['Untrusted']);
}
function middlewareMitm(socket, next) {
   middleware(socket, next, ['Mitm']);
}

//////////////////////////////////////////////
//////////// Exported Functions //////////////
//////////////////////////////////////////////
module.exports.middlewareTrusted = middlewareTrusted;
module.exports.middlewareUntrusted = middlewareUntrusted;
module.exports.middlewareMitm = middlewareMitm;
module.exports.getUserId = getUserId;
module.exports.getUserMasterCred = getUserMasterCred;
