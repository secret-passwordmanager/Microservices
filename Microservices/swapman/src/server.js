//////////////////////////////////////////////
////////////// Global Variables //////////////
//////////////////////////////////////////////

/* Basic express/ node modules */
const config = require('../config/config.json');
const app =  require('express')();
const server = require('http').createServer(app);

/* Socket.io modules */
const io = require('socket.io')(server);
const ioAuth = require('./helpers/ioAuth');

/* Socket.io namespaces */
const mitm = require('./sockets/mitm')(io.of('/mitm'));
const client = require('./sockets/client')(io.of('/client'));

//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////

io.use(ioAuth.jwtMiddleware);

server.listen(config.serverPort, () => {
   console.log('listening on port ' + config.serverPort);
});

//////////////////////////////////////////////
/////////////////// Stubs ////////////////////
//////////////////////////////////////////////

app.get('/', (req, res) => {
   console.log('hi')
   res.sendFile(__dirname + '/stubs/index.html');
});

io.on('connection', socket => {
   console.log('authed')
 });