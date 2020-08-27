/*
   This file contains functions that allow
   all of the namespaces to talk between 
   eachother. This file should be the only
   other place where the global variable
   @io is used throughout the code. 
*/

/*
   @description: This function notifies all sockets
   in the namespace @notifyRole about a new connection
   that is of role @newConRole
   @newConRole: The role of the newly created 
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


var trusted = {};
var untrusted = {};
trusted.newConn = notifyNewConn()