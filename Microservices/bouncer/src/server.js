//////////////////////////////////////////////
////////////// Global Variables //////////////
//////////////////////////////////////////////

/* Basic Modules */
const Express = require('express');
const BodyParser = require('body-parser');
const Http = require('axios');
const config = require('../config/config.json');
/* JSON body validator */
const Check = require('express-validator').check;
const Validate = require('express-validator').validationResult;

/* JWK/JWT Modules */
const Crypto = require('crypto');
const Jose = require('jose');
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
const App = Express();
/* Generate a new Jwk on startup */
var MyJwk = genJwk();

/*  
    @RefreshTokens: Stores all users'
    refreshtokens. Map key is @userId,
    map value is an array of all 
    refresh tokens that the user 
    currently has
*/
var RefreshTokens = new Map();

/* Use Body parser, and catch errors */
App.use((req, res, next) => {
   BodyParser.json({
      verify: addRawBody,
   })(req, res, (err) => {
      if (err) {
         console.error(err);
         res.sendStatus(400);
         return;
      }
      next();
   });
});

/* 
    Start Server on port specified 
    in the env file 
*/
App.listen(config.serverPort, ()=> {
   console.log('Server listening on port ' + config.serverPort);
});
//////////////////////////////////////////////
///////////////// Routes  ////////////////////
//////////////////////////////////////////////
/*
    This endpoint creates and stores a 
    refresh token for the user, assuming
    that their username and password were
    valid
*/
App.post('/auth/login', 
   [
      Check('username').isAscii(),
      Check('password').isAscii(),
      Check('masterCred').optional().isAscii()
   ],
   async (req, res) => 
   {
      /* Make sure request body is valid */
      const errors = Validate(req);
      if (!errors.isEmpty()) {
         return res.status(422).json({ 'errors': errors.array() });
      }

      /* Grab variables from request body */
      var username = req.body.username;
      var password = req.body.password;
      var masterCred = req.body.masterCred;
    
      /* Check if user exists on secret_user_api */
      var usmanResp = await getUserId(username, password, masterCred);
      if (usmanResp.status != 200) {
         return res.status(usmanResp.status).json(usmanResp.data);
      }

      /* See if User already has a userTokens array */
      var userId = usmanResp.data.id;
      var userRefreshTokens = RefreshTokens.get(userId);
      if (userRefreshTokens === undefined) {
         userRefreshTokens = [];
      } 

      /* Create a new Refresh Token and add it to the map */
      var newToken = {
         trusted: false,
         value: genRefreshToken()
      };

      /* If masterCred was specified, make it a trusted user */
      if (masterCred != undefined) {
         /* If there was a previous trusted token, remove it */
         var trustTokenIndex = userRefreshTokens.findIndex(t => t.trusted == true);
         if (trustTokenIndex != -1) {
            userRefreshTokens.splice(trustTokenIndex, 1);

            /* Blacklist that token globally */
            if (!blacklistJwt(userRefreshTokens.indexOf(trustTokenIndex))) {
               console.error('Error blacklisting token');
            }
         }
         newToken.trusted = true;
         newToken.masterCred = masterCred;
      }

      /* Add refreshToken to the refreshTokens map */
      userRefreshTokens.push(newToken);
      RefreshTokens.set(userId, userRefreshTokens);

      /* Return the user's Id and new refresh token */
      return res.json({
         'userId': userId,
         'refreshToken': newToken.value
      });
   }
);

/*
    This endpoint will delete the user's
    refresh token that was stored on the 
    server, thus preventing them from
    generating more JWT's
*/
App.post('/auth/logout', 
   [
      Check('userId').isNumeric(),
      Check('refreshToken').isBase64(),
      Check('global').optional().isBoolean()
   ],
   (req, res) => 
   {
      /* Make sure request body is valid */
      const errors = Validate(req);
      if (!errors.isEmpty()) {
         return res.status(422).json({ errors: errors.array() });
      }
      /* Grab variables from request body */
      var userId = req.body.userId;
      var refreshToken = req.body.refreshToken;
      var global = req.body.global;
      /* Grab user's refresh tokens */
      var userTokens = RefreshTokens.get(userId);
      if (userTokens === undefined) { 
         return res.status(403).json({'errors': 'User is not currently logged in'});
      }
      /* Find index of refresh token from user */
      var tokenIndex = userTokens.indexOf(refreshToken);
      /* If token was not found in array */
      if (tokenIndex == -1) {
         return res.status(403).json({'errors': 'Incorrect userId or refreshToken'});
      }
      /* Remove value from array */
      userTokens.splice(tokenIndex, 1);

      /* If user wants to be logged out globally, blacklist all tokens */
      if (global) {
         userTokens.forEach(t => {
            if(!blacklistJwt(t)) {
               console.error('Error blacklisting one of the user tokens');
            }
         });
      }
      /* Otherwise, just blacklist this one */
      else {
         if (!blacklistJwt(refreshToken)) {
            console.error('Error blacklisting token');
         }
      }
      /* 
            If array is now empty, or user specified
            to log out of all devices, delete his 
            userId from RefreshTokens map
        */


      if (userTokens.length == 0 || global) {
         RefreshTokens.delete(userId);
      } else {
         RefreshTokens.set(userId, userTokens);
      }
      /* Return a 200 OK status */
      return res.status(200).end();
   }
);

/*
    This endpoint returns a JWT that will be
    valid for 5 minutes if given a proper userid
    and refreshToken
 */
App.post('/auth/refresh',
   [
      Check('userId').isNumeric(),
      Check('refreshToken').isBase64()
   ],
   (req, res) => 
   {
      /* Make sure request body is valid */
      const errors = Validate(req);
      if (!errors.isEmpty()) {
         return res.status(422).json({ 'errors': errors.array() });
      }

      /* Grab variables from request body */
      var userId = parseInt(req.body.userId);
      var refreshToken = req.body.refreshToken;

      /* Check if this user has any refreshTokens */
      var userTokens = RefreshTokens.get(userId);
      if (userTokens === undefined) {
         return res.status(403).json({'errors': 'User is not logged in'});
      }

      /* Find the refresh token  */
      var foundToken = userTokens.find(x => x.value == refreshToken);
      if (foundToken === undefined) {
         return res.status(403).json({'errors': 'Token not found for user'});
      }

      /* Create jwt */
      var role = foundToken.trusted ? 'Trusted' : 'Untrusted';
      var response = {
         Jwt: genJwt(userId, role, refreshToken)
      };

      return res.json(response);    
   }
);

/* Temp route just for debugging */
App.post('/auth/verify',[
   Check('username').isAlphanumeric(),
   Check('jwtToken')
],
(req, res) => 
{
   /* Make sure request body is valid */
   const errors = Validate(req);
   if (!errors.isEmpty()) {
      return res.status(422).json({ 'errors': errors.array() });
   }

   var token = req.body.jwtToken;
   var legit = Jose.JWT.verify(token, MyJwk.toJWK());
   return res.json(legit);
});

//TODO: when there is bad JSON in body (even w/ just get request), it crashes
App.get('/auth/jwk', [
],
(req, res) => {
   res.send( MyJwk.toJWK());
});

//////////////////////////////////////////////
///////////// Helper Functions ///////////////
//////////////////////////////////////////////
/*
    Generates ad returns an RS256 JWK
*/
function genJwk()
{
   var opts = {
      alg: 'RS256',
      use: 'sig'
   };
   return Jose.JWK.generateSync('RSA', 2048, opts);
}
/* 
    Generates a JWT for the user that is valid 
    for 5 minutes 
*/
function genJwt(userId, role, refreshToken)
{
   var payload = {
      'unique_name': userId.toString(),
      'refreshToken': refreshToken,
      'role': role,
   };
   var signOpts = {
      algorithm: config.auth.alg,
      audience: config.auth.issuer,
      expiresIn: config.auth.expiresIn,
      iat: config.auth.iat,
      issuer: config.auth.issuer,
      subject: userId.toString(),
   };
   return Jose.JWT.sign(payload, MyJwk.toJWK(true), signOpts);
}
/* 
    Generates a random string of 64 bytes 
*/
function genRefreshToken() 
{
   return Crypto.randomBytes(64).toString('base64');
}
// /* 
//     This function returns the user's userId if 
//     username and password were valid. Returns -1
//     if user_api response was not 200 OK
// */
// async function getUserId(username, password, masterCred)
// {
//    var reqBody = {
//       Username: username,
//       Password: password
//    };
//    if (masterCred != undefined) {
//       reqBody.MasterCred = masterCred;
//    }
//    return Http.post(config.services.usman.urls.userVerify, 
//       reqBody
//    ).then(response => {
//       return response;
//    }).catch((err) => {
//       return err.response;
//    });
// }

/*
  This function prints the error into 
  the console log
*/
// eslint-disable-next-line no-unused-vars
function addRawBody(req, res, buf, _) {
   req.rawBody = buf.toString();
}

//////////////////////////////////////////////
////////////////// Webhooks //////////////////
//////////////////////////////////////////////
async function blacklistJwt(refreshToken)
{
   return await Http.post(config.services.usman.jwtBlacklist, {
      'refreshToken': refreshToken
   }).then(() => {
      return true;
   }).catch(() => {
      console.error('Error blacklisting token');
      return false;
   });
}