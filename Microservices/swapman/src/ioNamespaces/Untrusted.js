/*
   This file holds the code for handling the
   events that may happen on an untrusted client
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const ioAuth = require('../helpers/ioAuth');
const ioHelp = require('../helpers/ioHelpers');

//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
const ioUntrusted = io.of('/Untrusted');
ioUntrusted.use(ioAuth.middlewareUntrusted);

//////////////////////////////////////////////
///////////// Websocket Routes ///////////////
//////////////////////////////////////////////
ioUntrusted.on('connection', (socket) => {
   console.log('in ioUntrusted Connection');

   let userId = socket.handshake.query.userId;
   socket.join(userId); // Rn userId = 1
   try {
      ioHelp.notifyNewConn('Untrusted', 'Trusted', userId);
   }
   catch(error) {
      console.error(error);
   }

   socket.on('newSwap', swapRequest => {
      try {
         ioHelp.validateSwapRequest(swapRequest);
      }
      catch(err) {
         socket.emit('formatError', err.message);
      }
   });
});