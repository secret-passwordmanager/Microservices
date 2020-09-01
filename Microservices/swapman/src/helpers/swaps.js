/*
   Description. This file contains the logic
   for managing all stored swaps. From here,
   you can add and remove swaps
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////

var validator = require('validator');
//////////////////////////////////////////////
///////////////// Functions //////////////////
//////////////////////////////////////////////

/**
 * Description. This is the global variable that holds
 * all of the user's swaps
*/
var swaps = [];

/**
   Description. adds @swap into @swaps global variable
   @param {object} swap The swap to be placed into @swaps
   @return {void} n/a 
*/
function add(swap) {
   /* Sanitize swap object */
   swap = {
      userId: swap.userId,
      authId: swap.authId,
      domain: swap.domain,
      token: swap.token,
      ip: swap.ip,
      credId: null,
      credVal: null
   };
   validate.request(swap);

   if (swaps.find((curSwap) => curSwap.token === swap.token) != undefined) {
      return new Error('This swap already exists. Choose a new token');
   }

   /* Add swap to array */
   swaps.push(swap);
}

/**
 * Description. Checks if a swap exists in @swaps
 * @param {object} swap the swap you are checking for
 * @return {boolean} Returns true if found, false if not found
 */
function exists(swap) {
   if (swaps.find(s => 
      s.token == swap.token &&
      s.userId == swap.userId &&
      s.domain == swap.domain
   ) == undefined) {
      return false;
   }
   return true;
}

/**
 * Description. Deletes the swap from @swaps if it exists
 * @param {object} swap The swap to be deleted
 * @return {number} Returns 0 on success, -1 if the object 
 * is not found
 */
function remove(swap) {

   let indx = swaps.findIndex(s => 
      s.userId == swap.userId
      && s.token == swap.token
      && s.domain == swap.domain
      && s.authId == swap.authId 
   );
   /* If not found, return -1 */
   if (indx == -1)
      return -1;
   
   swaps.splice(indx, 1);
   return 0;
}

/**
 * Description. Given a userId, returns all 
 * of the swaps that have not yet been
 * approved (thus are still in the swaps 
 * global variable)
 * @param {number} userId The user's userId
 */
function getAll(userId) {
   /* return all of the user's swaps */
   return swaps.filter((swap) => swap.userId == userId);
}

//////////////////////////////////////////////
//////////// Validator Functions /////////////
//////////////////////////////////////////////

/**
 * Description. These are some extra functions
 * that can help validate swaps to make sure
 * that they have all of the necessary fields
 * to be a proper swap
 */
var validate = {

   /**
    * Description. Validates that the swap has all of the required 
    * parameters on request: domain, token, authId, and ip
    * @param {object} swap 
    * @return {void} n/a
    */
   request: (swap) => {

      if (!validator.isFQDN(swap.domain))
         throw new Error('Invalid domain in swap request. domain must be a valid website domain.');
      
      if (!validator.isAscii(swap.token))
         throw new Error('Invalid token in swap request. token must be an ascii value.');

      if (!validator.isAlphanumeric(swap.authId) || swap.authId.length != 4)
         throw new Error('Invalid authId in swap request. authId must be a 4 character alphanumeric.');
   },

   /**
    * Description: Validates that the swap has all of the required 
    * parameters on submission: domain, token, authId, and credId
    * @param {object} swap 
    * @return {void} n/a
    */
   submit: (swap) => {
      /* First validate against swapRequest */
      validate.request(swap);

      /* Then, make sure that a valid credId was given */
      if (isNaN(swap.credId) || swap.credId == undefined || swap.credId == null)
         throw new Error('Invalid value for credId. credId must be a number');
   }
};

//////////////////////////////////////////////
//////////// Exported Functions //////////////
//////////////////////////////////////////////

module.exports.add = add;
module.exports.exists = exists;
module.exports.remove = remove;
module.exports.getAll = getAll;
module.exports.validate = validate;