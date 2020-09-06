//////////////////////////////////////////////
////////////////// Modules ///////////////////
//////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const ev = require('express-validator');

const config = require('../config/config.json');
const services = require('./helpers/services');
const auth = require('./helpers/auth');
const tokenStore = require('./helpers/refreshTokenStore');
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////

const app = express();
app.listen(config.serverPort, () => {
   console.log('Server listening on port ' + config.serverPort);
});

app.use(bodyParser.json());


//////////////////////////////////////////////
///////////////// Routes  ////////////////////
//////////////////////////////////////////////
/*
    This endpoint creates and stores a 
    refresh token for the user, assuming
    that their username and password were
    valid
*/
app.post('/auth/login', 
   [
      ev.check('username').isAscii(),
      ev.check('password').isAscii(),
   ],
   async (req, res) => 
   {
      /* Make sure request body is valid */
      const errors = ev.validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(422).json({ 'errors': errors.array() });
      }
      try {
         /* Verify that user is valid & grab userId from http req to usman */
         let userId = await services.usman.getUserId(req.body.username, req.body.password);
         if (userId instanceof Error) {
            throw userId;
         }

         /* Create and store new refresh token */
         let tokenVal = tokenStore.create(userId);
         if (tokenVal instanceof Error) {
            throw tokenVal;
         }

         /* Return the newly created refresh token */
         return res.json({'refreshToken': tokenVal});
      } 
      /* If any exceptions are thrown, return with status 500 */
      catch (err) {
         console.log(err.message);
         return res.status(500).json({'Error': err.message});
      }
   }
);

/**
 * This endpoint can log out a user.
 * @param {string} refreshToken The user's refreshToken
 * that was given to them when they login.
 * @param {boolean} global Optional, but if set to true,
 * will log the user out of all of their devices 
*/
app.post('/auth/logout', 
   [
      ev.check('refreshToken').isHexadecimal(),
      ev.check('global').optional().isBoolean()
   ],
   async (req,res) => {
      /* Make sure request body is valid */
      const errors = ev.validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(422).json({ 'errors': errors.array() });
      }

      if (req.body.global != true) {
         req.body.global = false;
      }

      let user = null;
      try {
         user = auth.jwt.verify(req.get('Authorization').slice(7, req.get('Authorization').length));
         if (user instanceof Error) {
            throw user;
         }
      }
      catch (err) {
         return res.status(401).json({'Error': 'JWT is missing or is invalid'});
      }

      try {            
         /* Don't worry about global logout for now */
         let loginIdList = tokenStore.remove(req.body.refreshToken, false);
         if (loginIdList instanceof Error) {
            throw loginIdList;
         }

         let usmanResp = await auth.logout(parseInt(user.unique_name), loginIdList);
         if (usmanResp instanceof Error) {
            throw usmanResp;
         }
         return res.status(200).end();
      }
      catch(err) {
         console.log(err.message);
         return res.status(500).json({'Error': err.message});
      }
   });

app.post('/auth/refresh',
   [
      ev.check('refreshToken').isHexadecimal(),
      ev.check('masterCred').optional().isAscii()
   ],
   (req, res) => 
   {
      /* Make sure request body is valid */
      const errors = ev.validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(422).json({ 'errors': errors.array() });
      }
      try {
         /* Make sure token exists on the server */
         let token = tokenStore.get(req.body.refreshToken);
         if (token instanceof Error) {
            throw token;
         }
         if (token == undefined) {
            throw new Error('This refresh token was not found on the server');
         }

         /* If masterCred was specified, check that it is correct */
         if (req.body.masterCred != undefined) {
            let verify = services.usman.masterCredVerify(token.userId, req.body.masterCred);
            /* If verify isn't instance of error, masterCred is valid */
            if (verify instanceof Error) {
               throw verify;
            }
         }
         /* Generate jwt and return */
         return res.json({'jwt': auth.jwt.gen(token, req.body.masterCred)});
         
      }
      /* If any exceptions are thrown, return with status 500 */
      catch (err) {
         console.log(err.message);
         return res.status(500).json({'Error': err.message});
      }
   }
);

app.get('/auth/jwk', 
   [],
   (req, res) => {
      res.send(auth.jwk.get());
   }
);