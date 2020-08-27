//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const config = require('../../config/config.json');
const http = require('axios');
const jose = require('jose');

/* 
   @jwk: Global JWK that is used to validate all 
   requests 
*/
var jwk = null;

//////////////////////////////////////////////
/////////// Middleware Functions /////////////
//////////////////////////////////////////////
/*
   @description: this function validates the 
   jwt, and closes the connection if it
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
 function middleware(socket, next, roles) {
   return async function(socket,next) {
   try {
      /* If the jwk was not grabbed yet */
      if (jwk === null) {
         jwk = await getJwk();
      }

      /* Abort connection if there was a problem grabbing jwk */
      if (jwk === -1){
         throw 'There was an issue grabbing the jwk'; 
      }

      // /* Grab the jwt from the handshake */ TODO: Add back later
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

      /* Add role to handshake query to be used in io events */
      // socket.handshake.query.userId = auth.unique_name; //TODO: Add back, and remove next line
      socket.handshake.query.userId = 1;
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
}
/*
   @description: This function grabs the jwk from bouncer,
   whose url is defined in our config file. 
   @return: returns the jwk on success, -1 on error
*/
async function getJwk() {
   return  http.get(config.services.bouncer.jwkUrl)
      .then(resp => {
         return resp.data;
      })
      .catch(err => {
         console.error('Unable to grab jwk, bouncer may be down');
         return -1;
      });
}
/* 
   @description: These functions are wrappers over the 
   middleware function that allow us to define the roles 
   for each of our namespaces
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

