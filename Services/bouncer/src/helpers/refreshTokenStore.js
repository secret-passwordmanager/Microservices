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

/**
 * 
 * @param {string} tokenVal The 64 byte string that corresponds to a 
 * refresh token. 
 * @param {boolean} all If set to true, will delete all refreshtokens
 * in @tokens that match the user's userId.
 * @return {Array} Returns either the loginId that is 
 * associated with @tokenVal or a list of all loginId's the user has if
 * @all was set to true 
 */
function remove(tokenVal, all) {
   if (typeof tokenVal != 'string' || tokenVal.length != 128) {
      throw new Error('Invalid tokenVal parameter. tokenVal must be a string of size 128');
   }
   if (typeof all != 'boolean') {
      throw new Error('Invalid all parameter. all must be a boolean');
   }

   /* Delete the item from the array, but also keep the userId */
   let loginIdList = [];
   let token = null;
   token = tokens.splice(tokens.findIndex((t) => t.val == tokenVal), 1)[0];
   if (token == undefined) {
      return new Error('This token was not found on the server');
   }
   loginIdList.push(token.loginId);
   /* If all was specified, delete and return all  */

   if (all) {
      // eslint-disable-next-line for-direction
      for (var i = tokens.length - 1; i>-1; --i ) {
         if (tokens[i].userId == token.userId) {
            loginIdList.push(tokens[i].loginId);
            tokens.splice(i,1);
         }
      }
   }
   return loginIdList;
}


module.exports.create = create;
module.exports.get = get;
module.exports.remove = remove;