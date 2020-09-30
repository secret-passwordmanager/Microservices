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

app.get('/swap/mitm', (req, res) => {
   console.log('made GET request to /Mitm');
   res.sendFile(__dirname + '/stubs/mitm.html');
});

app.get('/swap/untrusted', (req, res) => {
   console.log('made GET request to /Untrusted');
   res.sendFile(__dirname + '/stubs/untrusted.html');
});

app.get('/swap/trusted', (req, res) => {
   console.log('made GET request to /Trusted');
   res.sendFile(__dirname + '/stubs/trusted.html');
});