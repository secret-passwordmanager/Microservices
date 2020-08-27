

var swaps = new Map();

function add(userId, swap) {
  
   /* Sanitize swap value */
   swap.approved = false;
   swap.credentialId = undefined;


   
   var userSwaps = swaps.get(userId);
   if (userSwaps === undefined) {
      userSwaps = [];
   }

   userSwaps.push(swap);

   /* Add swap back into */
   swaps.set(userId, userSwaps);
}

function approve(userId, swapId) {

}
function remove() {

}



function getAll() {

}

module.exports.add = add;
module.exports.remove = remove;
module.exports.read = read;
module.exports.approve = approve;