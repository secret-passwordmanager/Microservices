//////////////////////////////////////////////
//////////// Module Declarations /////////////
//////////////////////////////////////////////

/* Basic express/node modules */
const config = require('../config/config.json');
const app =  require('express')();
const server = require('http').createServer(app);


/* Socket.io modules */
global.io = require('socket.io')(server);
require('./sockets/client');
require('./sockets/mitm');

//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////

server.listen(config.serverPort, () => {
   console.log('listening on port ' + config.serverPort);
});

//////////////////////////////////////////////
/////////////////// Stubs ////////////////////
//////////////////////////////////////////////

app.get('/', (req, res) => {
   console.log('made GET request to /');
   res.sendFile(__dirname + '/stubs/index.html');
});

io.of('/client').emit('hello', 'test');