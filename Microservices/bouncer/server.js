//////////////////////////////////////////////
////////////// Global Variables //////////////
//////////////////////////////////////////////

/* Node Modules */
require('dotenv').config();
const Express = require('express');
const BodyParser = require('body-parser');
const App = Express();
const Jwt = require('jsonwebtoken')
const Crypto = require('crypto');
const Http = require('axios');

const Check = require('express-validator').check;
const Validate = require('express-validator').validationResult;
const Body = require('express-validator').body;
/* Key that will sign and verify JWT tokens */
const RsaKey = genRsaKey();

/* Stores all users Refresh Tokens */
var RefreshTokens = new Map();

//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////

App.use(BodyParser.json());
App.listen(process.env.BOUNCER_PORT);
//////////////////////////////////////////////
///////////////// Routes  ////////////////////
//////////////////////////////////////////////

App.post('/auth/reauth',
    [
        Check('username').isAlphanumeric(),
        Check('refreshToken').isBase64()
    ],
    (req, res) => 
    {
        var ts = new Date();
        console.log(ts.toUTCString());
        /* Make sure request body is valid */
        const errors = Validate(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        /* Grab variables from request body */
        var username = req.body.username;
        var refreshToken = req.body.refreshToken;
    
        /* Check if refreshToken is valid */
        var userTokens = RefreshTokens.get(username);
        if (userTokens === undefined) {
            return res.status(403).json({errors: 'User is not logged in'});
        } 
        else if (userTokens.find(x => x == refreshToken) === undefined) {
            return res.status(403).json({errors: 'Token not found for user'});
        }
    
        /* Generate a JWT and return it */
        return res.json(genJwtToken(username));
    }
);

App.post('/auth/login', 
    [
        Check('username').isAlphanumeric(),
        Check('password').isAlphanumeric()
    ],
    (req, res) => 
    {
        /* Make sure request body is valid */
        const errors = Validate(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        /* Grab variables from request body */
        var username = req.body.username;
        var password = req.body.password;
        /* Check if user exists on secret_user_api */
        console.log("hererere")
        verifyUser(username,password).then(apiRes => {
            
            if (apiRes.status == 200) {
                
                var userTokens = RefreshTokens.get(username);
                if (userTokens === undefined) {
                    userTokens = [];
                }
                var newToken = genRefreshToken();
                userTokens.push(newToken);
                RefreshTokens.set(username, userTokens);
                console.log(RefreshTokens.get(username));            
                res.json({
                    refreshToken: newToken
                });
            }
        })
        .catch((apiErr) => {
            
            console.log(apiErr.response.status);
            res.status(404).json({errors: 'Incorrect username or password'});
        });
    }
);

App.post('/auth/logout', 
    [
        Check('username').isAlphanumeric(),
        Check('refreshToken').isBase64()
    ],
    (req, res) => 
    {
        /* Make sure request body is valid */
        const errors = Validate(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        /* Grab variables from request body */
        var username = req.body.username;
        var refreshToken = req.body.refreshToken;

        /* Grab user's refresh tokens */
        var userTokens = RefreshTokens.get(username);
        if (userTokens === undefined) { 
            return res.status(400).json({errors: 'User is not currently logged in'});
        }

        /* Find and delete this refresh token from user */
        var thisTokenIndex = userTokens.indexOf(refreshToken);
        if (thisTokenIndex > -1) {
            userTokens.splice(thisTokenIndex, 1);
            RefreshTokens.set(username, userTokens);
            return res.status(200).end();
        } else {
            return res.status(404).json({errors: 'Incorrect username or refreshToken'});
        }
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
        return res.status(422).json({ errors: errors.array() });
    }
    
    var token = req.body.jwtToken;

    var verifyOptions = {
        issuer:  process.env.JWT_ISSUER,
        subject:  req.body.username,
        audience:  req.body.username,
        expiresIn:  '5m',
        algorithm:  ['RS256']
    };
    var legit = Jwt.verify(token, RsaKey.publicKey, verifyOptions);
    console.log(JSON.stringify(legit));
    
    res.json(legit);
});

//TODO: when there is bad JSON in body (even w/ just get request), it crashes
App.get('/auth/jwk', [
],
(req, res) => {
    res.send(RsaKey.publicKey);
});

//////////////////////////////////////////////
///////////// Helper Functions ///////////////
//////////////////////////////////////////////
/* 
    Generates a jwt for the user that is valid 
    for 5 minutes 
*/
function genJwtToken(username)
{
    var payload = {
        "unique_name": "5",
        "role": "User",
        "nbf": 1597298663,
        "iat": Math.floor(Date.now() / 1000)
      }
    var signOpts = {
        issuer: process.env.JWT_ISSUER,
        subject: username,
        audience: username,
        expiresIn: '5m',
        algorithm: 'RS256'
    }
    return {
        jwtToken: Jwt.sign(payload, RsaKey.privateKey, signOpts)
    };
};
/* 
    Generates a random string of 64 bytes 
*/
function genRefreshToken() 
{
    return Crypto.randomBytes(64).toString('base64');
};
/* 
    This function generates an RSA private and public key  
*/
function genRsaKey() 
{
    return { publicKey, privateKey } = Crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        }
    });
};
/* 
    This function returns true if the user exists
    on the secret_user_api
*/
function verifyUser(username, password)
{
    return Http.post(process.env.USER_API_URL + 'user/verify', {
        Username: username,
        Password: password
    })
}