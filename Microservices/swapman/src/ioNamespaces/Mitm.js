/*
   This file holds all of the socket.io
   events for connecting to the mitm
   proxy  
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
const mitmIo = io.of('/Mitm');
mitmIo.use(ioAuth.middlewareMitm);

//////////////////////////////////////////////
///////////// Websocket Routes ///////////////
//////////////////////////////////////////////
mitmIo.on('connection', (socket) => {
   console.log('in mitmIo Connection ');
   socket.emit('he', 'test');


   /**
    * Description. This event should only be fired by a mitm client.
    * If the user has no more swaps, it will notify both the trusted 
    * and untrusted clients that all requests have (seemingly) been
    * fulfilled
    * @param {object} swap The swap that mitm receieved
    */
   socket.on('swapReceived', (swap) => {
      
      /* Delete swap from swaps */
      swaps.remove(swap);

      /* If user has no more pending swaps, notify trusted and untrusted */
      if(swaps.getAll(swap.userId).length == 0) {
         ioNotify.trusted.swapEmpty(swap.userId);
         ioNotify.untrusted.swapEmpty(swap.userId);
      }


   });
});