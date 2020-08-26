const config = require('../../config/config.json');
const http = require('axios');
const jose = require('jose');
const { JWTClaimInvalid } = require('jose/lib/errors');
/*
   This function grabs the jwk from bouncer.
   If bouncer is not up yet, it will keep retrying
*/

let jwk = null;

exports = module.exports = {
   async clientMiddleware(socket, next) {
      try {
         /* If the jwk was not grabbed yet */
         if (jwk === null) {
            jwk = await getJwk();
         }

         /* Abort connection if there was a problem grabbing jwk */
         if (jwk === -1){
            throw new Error('There was an issue grabbing the jwk');
         }
      
         /* Grab the jwt from the handshake */
         let jwt = socket.handshake.query.jwt;
         if (jwt === undefined) {
            throw new JWTClaimInvalid('The request contains an invalid jwt');
         }
         
         /* Add role and userId to handshake query */
         let auth = jose.JWT.verify(jwt, jwk);
         socket.handshake.query.userId = auth.unique_name;
         socket.handshake.query.role = auth.role;
      }
      /* If there is an error, disconnect and don't call next() */
      catch(err) {
         console.error(err);
         socket.disconnect();
         return;
      }

      /* If no errors, call next() as normal */
      return next();
   },
   async mitmMiddleware(socket, next) {
      try {

      }
      catch(err) {
         console.error(err);
         socket.disconnect();
         return;
      }
      /* If no errors, call next() as normal */
      return next();
   }
}

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
