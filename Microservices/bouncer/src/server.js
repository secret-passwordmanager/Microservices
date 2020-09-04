//////////////////////////////////////////////
////////////////// Modules ///////////////////
//////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const ev = require('express-validator');

const config = require('../config/config.json');
const services = require('./helpers/services');
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
         let token = tokenStore.get(req.body.refreshToken);
         if (token instanceof Error) {
            throw token;
         }
         if (token == undefined) {
            throw new Error('This refresh token was not found on the server');
         }

      
         
      }
      /* If any exceptions are thrown, return with status 500 */
      catch (err) {
         console.log(err.message);
         return res.status(500).json({'Error': err.message});
      }
   
   
   }
);
