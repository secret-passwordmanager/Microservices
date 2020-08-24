/*
   This file holds all of the socket.io
   events for connecting to the mitm
   proxy  
*/
exports = module.exports = (mitm) => {
   mitm.on('connection', (socket) => {
      console.log('a client connected');
      socket.on('disconnect', () => {
         console.log('client disconnected');
      });
   }); 
}