//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////

/* Basic express/node modules */
const config = require('../config/config.json');
const app =  require('express')();
const server = require('http').createServer(app);

/* Socket.io modules */
global.io = require('socket.io')(server);
require('./ioNamespaces/untrusted');
require('./ioNamespaces/trusted');
require('./ioNamespaces/mitm');
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////

server.listen(config.serverPort, () => {
   console.log('listening on port ' + config.serverPort);
});
//////////////////////////////////////////////
/////////////////// Stubs ////////////////////
//////////////////////////////////////////////

app.get('/mitm', (req, res) => {
   console.log('made GET request to /Mitm');
   res.sendFile(__dirname + '/stubs/Mitm.html');
});

app.get('/untrusted', (req, res) => {
   console.log('made GET request to /Untrusted');
   res.sendFile(__dirname + '/stubs/Untrusted.html');
});

app.get('/trusted', (req, res) => {
   console.log('made GET request to /Trusted');
   res.sendFile(__dirname + '/stubs/Trusted.html');
});