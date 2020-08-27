/*
   This file holds the code for handling the
   events that may happen on a trusted client
*/
//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////
const ioAuth = require('../helpers/ioAuth');
const ioHelp = require('../helpers/ioHelpers');

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
   let userId = socket.handshake.query.userId;

   socket.join(userId); // Rn userId = 1
   try {
      ioHelp.notifyNewConn('Trusted', 'Untrusted', userId);
   }
   catch(error) {
      console.error(error);
   }

   
   
   



});