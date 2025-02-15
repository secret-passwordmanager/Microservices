/**
 * Description. This file holds the code for 
 * handling the events that may happen on an
 * untrusted client
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
ioUntrusted.use(ioAuth.middleware.untrusted);
//////////////////////////////////////////////
///////////// Websocket Routes ///////////////
//////////////////////////////////////////////

ioUntrusted.on('connection', (socket) => {
   console.log('in ioUntrusted Connection');

   let userId = ioAuth.getUserId(socket.handshake.query.jwt);
   socket.join(userId);

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
         // swaps.validate.request(swapRequest);
         swapRequest.userId = userId;
         swapRequest.ip = socket.request.connection.remoteAddress;

         let addRtn = swaps.add(swapRequest);
         if (addRtn instanceof Error)
            throw addRtn;

         ioNotify.trusted.swapNew(swapRequest);
      }
      catch(err) {
         socket.emit('err', err.message);
      }
   });

   /**
    * Description. By requesting this event, the user can 
    * get all requests that have yet to be approved
    * @return {object} swaps[]
    */
   socket.on('swapsNumPending', () => {
      socket.emit('swapGot', swaps.getAll(userId).length);
   });

   /**
    * Description. This even is automatically called
    * when an untrusted client closes the connection
    * When this occurs, we notify our trusted clients
    * that an untrusted device has disconnected
    */
   socket.on('disconnect', () => {
      ioNotify.trusted.newDisconn(userId);
      // Perhaps good place to delete all pending swaps      
   });
});