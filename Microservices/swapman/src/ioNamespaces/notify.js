/*
   This file contains functions that allow
   all of the namespaces to talk between 
   eachother. This file should be the only
   other place where the global variable
   @io is used throughout the code. 
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
/*global io*/
var config = require('../../config/config.json');

/*
   @Description. This function notifies all sockets
   in the namespace @notifyRole about a new connection
   that is of role @newConRole
   @newConRole: The role of the newly created 
*/
function notifyNewConn(newConRole, notifyRole, userId) {

   /* Make sure parameters are valid */
   if (!config.namespaces.includes(newConRole)) {
      throw new Error('Invalid new connection role');
   }
   if (!config.namespaces.includes(notifyRole)) {
      throw new Error('Invalid notifying role');
   }

   io.of(notifyRole).to(userId).emit('connectionNew', newConRole);
}


var trusted = {
   newConn: (userId) => {
      notifyNewConn('Untrusted', 'Trusted', userId);
   },
   newDisconn: (userId) => {
      io.of('Trusted').to(userId).emit('connectionDisconnect');
   },
   swapNew: (userId) => {      
      io.of('Trusted').to(userId).emit('swapNew');
   },
   swapEmpty: (userId) => {
      io.of('Trusted').to(userId).emit('swapEmpty');
   }
};

var untrusted = {
   newConn: (userId) => {
      notifyNewConn('Trusted', 'Untrusted', userId);
   },
   newDisconn: (userId) => {
      io.of('Untrusted').to(userId).emit('connectionDisconnect');
   },
   swapEmpty: (userId) => {
      io.of('Trusted').to(userId).emit('swapEmpty');
   }
};

var mitm = {
   swapApproved: (swap) => {
      io.of('Mitm').emit('swapApproved', swap);
   }
};

//////////////////////////////////////////////
//////////// Exported Functions //////////////
//////////////////////////////////////////////
module.exports.trusted = trusted;
module.exports.untrusted = untrusted;
module.exports.mitm = mitm;