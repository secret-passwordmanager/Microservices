/*
   @description: This file contains the entire
   logic for all swaps.
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const config = require('../../config/config.json');
var validator = require('validator');
var http = require('axios');

//////////////////////////////////////////////
///////////////// Functions //////////////////
//////////////////////////////////////////////
/* 
   @description: This is the global var*/
var swapsMap = new Map(); //TODO: How does both trusted.js and untrusted.js have the same map
/*
   @description: ad
*/
function add(userId, swap) {
   /* Sanitize swap object */
   swap = {
      authId: swap.authId,
      domain: swap.domain,
      token: swap.token,
      approved: false,
      credentialId: null
   };

   /* Check if user already has a value in swapsMap */
   let userSwaps = swapsMap.get(userId);
   if (userSwaps === undefined) {
      userSwaps = [];
   }

   if (userSwaps.find((curSwap) => curSwap.token === swap.token) != undefined) {
      throw new Error("This swap already exists. Choose a new token");
   }

   /* Add swap, and put back */
   userSwaps.push(swap);
   swapsMap.set(userId, userSwaps);
}
function approve(userId, swapId) {

}
function remove() {

}
function getAll(userId) {
   let userSwaps = swapsMap.get(userId);
   if (userSwaps === undefined) {
      userSwaps = [];
   }
   /* Make sure to only return swaps that have not yet been approved */
   return userSwaps.filter((swap) => swap.approved == false)};

//////////////////////////////////////////////
////////////// Helper Functions //////////////
//////////////////////////////////////////////
function validateSwapRequest(swap) {

   if (!validator.isFQDN(swap.domain))
      throw new Error('Invalid domain in swap request. domain must be a valid website domain.');
   
   if (!validator.isAscii(swap.token))
      throw new Error('Invalid token in swap request. token must be an ascii value.');

   if (!validator.isAlphanumeric(swap.authId) || swap.authId.length != 4)
      throw new Error('Invalid authId in swap request. authId must be a 4 character alphanumeric.');
}
async function validateSwapSubmit(swap, jwt) {

   /* First validate against swapRequest */
   validateSwapRequest(swap);

   /* Make sure that this credential can be used on this domain */
   await http.get(config.services.usman.verifyCredUrl, 
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

   })
   .catch((err) => {
      throw new Error('Could not verify that credential could be used on this domain');
   });
}

//////////////////////////////////////////////
//////////// Exported Functions //////////////
//////////////////////////////////////////////
module.exports.add = add;
module.exports.remove = remove;
module.exports.getAll = getAll;
module.exports.approve = approve;
module.exports.helpers = {
   validateSwapRequest: validateSwapRequest,
   validateSwapSubmit: validateSwapSubmit
}

