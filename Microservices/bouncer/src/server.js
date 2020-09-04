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
