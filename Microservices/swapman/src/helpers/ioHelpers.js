//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const config = require('../../config/config.json');
var validator = require('validator');



function validateSwapRequest(swap) {

   if (!validator.isFQDN(swap.domain))
      throw new Error('Invalid domain in swap request. domain must be a valid website domain.');
   
   if (!validator.isAscii(swap.token))
      throw new Error('Invalid token in swap request. token must be an ascii value.');
   console.log(swap.authId);
   if (!validator.isInt(swap.authId, {min: 0, max: 9999}))
      throw new Error('Invalid authId in swap request. authId must be a value between 1 and 9999.');
}

module.exports.notifyNewConn = notifyNewConn;
module.exports.validateSwapRequest = validateSwapRequest;