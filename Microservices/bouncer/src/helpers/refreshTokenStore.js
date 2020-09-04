const auth = require('./auth');

var tokens = [];

/**
 * Description. Will generate and return a refresh token.
 * @param {number} userId The id for the user you are trying to create
 * @return {object} Returns a 64 byte string that can be used to
 * identify a refreshToken
 */

function create(userId) {

   if (typeof userId != 'number') {
      throw new Error('userId param must be a number');
   }

   let newToken = {
      userId: userId,
      val: auth.refreshToken.genVal(),
      loginId: auth.refreshToken.genLoginId()
   };
   tokens.push(newToken);
   return newToken.val;
}

/**
 * Description. Checks if the refresh token given exists on the server
 * @param {string} tokenVal The 64 byte string that corresponds to a 
 * refresh token.
 * @return {object} Returns the refresh token that is associated with 
 * @tokenVal. Returns undefined if the refresh token that is associated
 * with @tokenVal is not found.
 */
function get(tokenVal) {
   if (typeof tokenVal != 'string' || tokenVal.length != 128) {
      throw new Error('Invalid tokenVal parameter. tokenVal must be a string of size 128');
   }
   return tokens.find((t) => t.val == tokenVal);
}

function remove(tokenVal) {

}


module.exports.create = create;
module.exports.get = get;
module.exports.remove = remove;