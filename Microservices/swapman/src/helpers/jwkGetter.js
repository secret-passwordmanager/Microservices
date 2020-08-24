const config = require('../../config/config.json');
const http = require('axios');

/*
   This function grabs the jwk from bouncer.
   If bouncer is not up yet, it will keep retrying
*/

exports = module.exports = async () => {

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