
require('./sockets/mitm');


var swaps = new Map();

var tmp = 0;


/*
   swap has 3 member variables: 

*/
function add (userId, swap) {
   tmp += 1;
   return tmp;
   mitm.emit()
};

function remove() {

}



function read() {

}

module.exports.add = add;
module.exports.remove = remove;
module.exports.read = read;
mitm.on('connection', (socket) => {
   console.log('unique string')
   console.log(socket.handshake.query)
})
