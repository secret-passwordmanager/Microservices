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
mitmIo.use(ioAuth.middleware.mitm);
//////////////////////////////////////////////
///////////// Websocket Routes ///////////////
//////////////////////////////////////////////

mitmIo.on('connection', (socket) => {

   console.log('in mitmIo Connection ');
   socket.join('Mitm');
   
   /**
    * Description. Once the mitm client recieves a swap, it should 
    * call this event, so that we can delete the swap from @swaps .
    * Additionally, we check if the user has any more swaps left. 
    * If they do not, we notify both the trusted and untrusted 
    * clients that all requests have been fullfilled.
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