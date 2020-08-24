//////////////////////////////////////////////
////////////// Global Variables //////////////
//////////////////////////////////////////////

/* Basic express/ node modules */
const config = require('../config/config.json');
const app =  require('express')();
const server = require('http').createServer(app);

/* Socket.io modules */
const io = require('socket.io')(server);

/* Socket.io namespaces */
const mitm = require('./sockets/mitm')(io.of('/mitm'));
const client = require('./sockets/client')(io.of('/client'));

/* Jwk Grabber function */
const jwkGetter = require('./helpers/jwkGetter');
const jose = require('jose');
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
let jwk;
let pem;

let x = jwkGetter().then(x => {
   const key = jose.JWK.asKey(x);
   io.use((socket, next) => {
      //console.log(socket.handshake.query.Authorization);

      let legit = jose.JWT.verify(socket.handshake.query.Authorization, x);
      console.log(legit);
      //console.log(socket.handshake.query)
      return next();
      
   });
});

// .then(j => {
//   /* set socket.io require jwt auth */
// io.use(ioJwt.authorize({
//    secret: j,
//    handshake: true,
//    auth_header_required: true
//  }));
 
// })





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