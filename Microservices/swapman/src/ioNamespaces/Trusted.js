/*
   This file holds the code for handling the
   events that may happen on a trusted client
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const ioAuth = require('../helpers/ioAuth');
const ioNotify = require('./notify');
const swaps = require('../helpers/swaps');

//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
const ioTrusted = io.of('/Trusted');
ioTrusted.use(ioAuth.middlewareTrusted);

//////////////////////////////////////////////
///////////// Websocket Routes ///////////////
//////////////////////////////////////////////
ioTrusted.on('connection', (socket) => {
   console.log('in Trusted Connection');
   let userId = ioAuth.getUserId(socket.handshake.query.jwt);
   socket.join(userId); // Rn userId = 1

   try {
      ioNotify.untrusted.newConn(userId);
   }
   catch(err) {
      console.error(err);
   }

   socket.on('disconnect', () => {
      ioNotify.untrusted.newDisconn(userId);
      //TODO: Perhaps good place to delete all pending swaps      
   });
   
   socket.on('swapGet', () => {
      socket.emit('swapGot', swaps.getAll(userId));
   });

   socket.on('swapSubmit', async (swap) => {
      try {
         await swaps.helpers.validateSwapSubmit(swap, socket.handshake.query.jwt)
      }
      catch(err) {
         //console.error(err);
         socket.emit('err', err.message);
      }
   });
});