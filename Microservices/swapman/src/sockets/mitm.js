/*
   This file holds all of the socket.io
   events for connecting to the mitm
   proxy  
*/

const mitmIo = io.of('/mitm');
const ioAuth = require('../helpers/ioAuth');
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////

mitmIo.use(ioAuth.mitmMiddleware);


mitmIo.on('connection', (socket) => {
   console.log('in mitmIo Connection ')
   socket.emit('he', 'test');
})