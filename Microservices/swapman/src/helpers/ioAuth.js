const config = require('../../config/config.json');
const http = require('axios');
const jose = require('jose');
/*
   This function grabs the jwk from bouncer.
   If bouncer is not up yet, it will keep retrying
*/

let jwk = null;

exports = module.exports = {

   jwtMiddleware(socket, next) {
      if (jwk === null) {
         jwk = getJwk();
         console.log('jwk empty');
         socket.disconnect(true);
      }
      console.log(jwk)
      return next();
   }


}


async function getJwk() {
   return http.get(config.services.bouncer.jwkUrl)
      .then(resp => {
         return resp.data;
      })
      .catch(err => {
         console.error('Unable to grab jwk, bouncer may be down');
         return -1;
      });
}

async function tmp() {

   let bouncerUp = true;
   let jwk;
   do {
      jwk = await getJwk();

      if (jwk == -1) {
         bouncerUp = false;
         console.log("retrying to get jwk");
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
   } while(!bouncerUp);

   return jwk;
}
