/*
   This file holds the code for handling the
   events that may happen on a trusted client
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
/*global io*/

const ioAuth = require('../helpers/ioAuth');
const ioNotify = require('./notify');
const swaps = require('../helpers/swaps');
var usman = require('../helpers/services').usman;
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////

const ioTrusted = io.of('/Trusted');
ioTrusted.use(ioAuth.middleware.trusted);
//////////////////////////////////////////////
///////////// Websocket Routes ///////////////
//////////////////////////////////////////////

ioTrusted.on('connection', (socket) => {
   console.log('in Trusted Connection');

   /* Grab the userId, and join a room with that key */
   let userId = ioAuth.getUserId(socket.handshake.query.jwt);
   let masterCred = socket.handshake.query.masterCred; //TODO: replace with new usman
   console.log(masterCred)
   socket.join(userId); // Rn userId = 1

   /* Notify untrusted devices that a trusted
   device had connected */
   try {
      ioNotify.untrusted.newConn(userId);
   }
   catch(err) {
      console.error(err);
   }

   /**
    * Description. This event is automatically called 
    * anytime the user closes the connection
    */
   socket.on('disconnect', () => {
      ioNotify.untrusted.newDisconn(userId);
      //TODO: Perhaps good place to delete all pending swaps      
   });

   /**
    * Description. By requesting this event, the user can 
    * get all requests that have yet to be approved
    * @return {object} swaps[]
    */
   socket.on('swapGet', () => {
      socket.emit('swapGot', swaps.getAll(userId));
   });

   /**
    * Description. By requesting this event, the user can approve
    * pending requests that were made by the untrusted device
    * @param {object} swap The swap that the user wants to 
    * approve
    */
   socket.on('swapApprove', async (swap) => {
      try {
         /* Make sure that swap has all necessary params to be submitted */
         await swaps.validate.submit(swap, socket.handshake.query.jwt);
         
         /* Make sure that the swap has been requested */
         if (!swaps.exists(swap))
            throw Error('This swap has not been requested');

         /* Make sure that this credential can be used on this domain */
         if(await usman.verifySwap(swap, socket.handshake.query.jwt) instanceof Error) {
            throw Error('Swap could not be approved for this domain');
         }

         /* Get the decrypted credential */
         if (await usman.decryptSwap(swap, socket.handshake.query.jwt, masterCred) instanceof Error) {
            throw Error('Swap could not be decrypted');
         }

         /* Send the swap to the mitm namespace */
         ioNotify.mitm.swapApproved(swap);
      }
      catch(err) {
         //console.error(err);
         socket.emit('err', 'Error: ' + err.message);
      }
   });
});