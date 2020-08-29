/*
   This file holds the code for handling the
   events that may happen on an untrusted client
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
/*global io*/
const ioAuth = require('../helpers/ioAuth');
const ioNotify = require('./notify');
const swaps = require('../helpers/swaps');

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

   let userId = ioAuth.getUserId(socket.handshake.query.jwt);
   socket.join(userId); // Rn userId = 1

   try {
      ioNotify.trusted.newConn(userId);
   }
   catch(error) {
      console.error(error);
   }

   /**
    * Description. This event should be called
    * by an untrusted device (our browser extension)
    * to request a new swap. Here, we check that the
    * @swapRequest had all of the required parameters,
    * and add it to @swaps
    * 
    * @param {object} swapRequest The swap that is being
    * requested
    */
   socket.on('swapNew', swapRequest => {
      try {
         console.log('In Untrusted newSwap');
         swaps.helpers.validateSwapRequest(swapRequest);
         swapRequest.userId = userId;

         swaps.add(swapRequest);
         ioNotify.trusted.newSwap(userId);
      }
      catch(err) {
         socket.emit('err', err.message);
      }
   });

   socket.on('disconnect', () => {
      ioNotify.trusted.newDisconn(userId);
   // Perhaps good place to delete all pending swaps      
   });


});