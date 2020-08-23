//////////////////////////////////////////////
////////////// Global Variables //////////////
//////////////////////////////////////////////
require('dotenv').config({path: '.env'});

const app =  require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

/* Socket.io Namespaces */
const mitm = io.of('/mitm');
const untrusted = io.of('/untrusted');
const trusted = io.of('/trusted');
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
http.listen(process.env.SERVER_PORT, () => {
    console.log('listening on port ' + process.env.SERVER_PORT);
});

//////////////////////////////////////////////
/////////////////// Stubs ////////////////////
//////////////////////////////////////////////
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/stubs/index.html');
});
app.get('/mitm', (req, res) => {
    res.sendFile(__dirname + '/stubs/mitm.html');
});
app.get('/trusted', (req, res) => {
    res.sendFile(__dirname + '/stubs/untrusted.html');
});
app.get('/untrusted', (req, res) => {
    res.sendFile(__dirname + '/stubs/trusted.html');
});

//////////////////////////////////////////////
///////////////// Socket.io //////////////////
//////////////////////////////////////////////


mitm.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
});
