/*
   This file holds all of the socket.io 
   events for all clients connecting to
   swapman (both trusted & untrusted)
*/
exports = module.exports = (client) => {
   client.on('connection', (socket) => {
      console.log('a client connected');
      socket.on('disconnect', () => {
         console.log('client disconnected');
      });
   }); 
  }