//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const config = require('../../config/config.json');
var validator = require('validator');

/*
   @description: This function notifies all sockets
   in the namespace @notifyRole about a new connection
   that is of role @newConRole
*/
function notifyNewConn(newConRole, notifyRole, roomId) {

   /* Make sure parameters are valid */
   if (!config.namespaces.includes(newConRole)) {
      throw new Error('Invalid new connection role');
   }
   if (!config.namespaces.includes(notifyRole)) {
      throw new Error('Invalid notifying role');
   }

   io.of(notifyRole).to(roomId).emit('newConnection', newConRole);

   
}


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