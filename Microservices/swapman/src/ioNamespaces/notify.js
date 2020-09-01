/*
   This file contains functions that allow
   all of the namespaces to talk between 
   eachother. If one namespace wants to 
   communicate with another, it should use 
   the functions within this file. 
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
/*global io*/

var trusted = {
   newConn: (userId) => {
      io.of('Trusted').to(userId).emit('connectionNew', 'Untrusted');
   },
   newDisconn: (userId) => {
      io.of('Trusted').to(userId).emit('connectionDisconnect');
   },
   swapNew: (swap) => {      
      io.of('Trusted').to(swap.userId).emit('swapNew', swap);
   },
   swapEmpty: (userId) => {
      io.of('Trusted').to(userId).emit('swapEmpty');
   }
};

var untrusted = {
   newConn: (userId) => {
      io.of('Untrusted').to(userId).emit('connectionNew', 'Trusted');
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