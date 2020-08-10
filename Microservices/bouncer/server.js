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

/* Key that will sign and verify JWT tokens */
const RsaKey = genRsaKey();

/* Stores all users Refresh Tokens */
var RefreshTokens = new Map();

//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
App.use(BodyParser.json());
App.listen(process.env.PORT);



//////////////////////////////////////////////
///////////////// Routes  ////////////////////
//////////////////////////////////////////////

App.post('/auth',
    [
        Check('username').isAlphanumeric(),
        Check('refreshToken').isBase64()
    ],
    (req, res) => {
        const errors = Validate(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        var username = req.body.username;
        var refreshToken = req.body.refreshToken;

        var userTokens = RefreshTokens.get(username);
        
        /* Check if refreshToken is valid */
        if (userTokens === undefined) {
            return res.status(403).json({errors: 'User is not logged in'});
        } 
        else if (userTokens.find(x => x == refreshToken) === undefined) {
            return res.status(403).json({errors: 'Token not found for user'});
        }
    
       
        res.json({token: jwtToken});
    }
);

App.post('/login', 
    [
        Check('username').isAlphanumeric(),
        Check('password').isAlphanumeric()
    ],
    (req, res) => 
    {
        const errors = Validate(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        var username = req.body.username;
        var password = req.body.password;

        /* Lol make request to user_api for now 
        to check if credentials are valid */
        Http.post('http://localhost:8000/user/authenticate', {
            Username: username,
            Password: password
        })
        .then(apiRes => {
        
            if (apiRes.status == 200) {

                var userTokens = RefreshTokens.get(username);

                /* If user was not found, 
                set userTokens as array */
                if (userTokens === undefined) {
                    userTokens = [];
                }
                var newToken = genRefreshToken();
                userTokens.push(newToken);
                RefreshTokens.set(username, userTokens);
                
                res.json({
                    refreshToken: newToken
                });
            } else {
                return res.status(apiRes.status).json(apiRes.body);
            }
        }) 
        .catch(apiErr => {
            return res.status(apiErr.response.status).json( apiErr.response.data);
        });


    }
);

App.post('/verify', (req, res) => {
    var token = req.body.token;

    var verifyOptions = {
        /* issuer:  i,
        subject:  s,
        audience:  a, */
        expiresIn:  '12h',
        algorithm:  ['RS256']
       };
       var legit = Jwt.verify(token, RsaKey.publicKey, verifyOptions);
       console.log(JSON.stringify(legit));
})

App.get('/publickey', (req, res) => {
    res.json(RsaKey).publicKey;
})

//////////////////////////////////////////////
///////////// Helper Functions ///////////////
//////////////////////////////////////////////

/* 
    Generates a jwt for the user that is valid 
    for 5 minutes 
*/
function genJwt(username)
{
    var payload = {
        data1: 'Data 1',
        data2: 'Data 2',
        data3: 'Data 3',
        data4: 'Data 4',
    };

    var signOpts = {
        issuer: process.env.JWT_ISSUER,
        subject: username,
        audience: username,
        expiresIn: '5m',
        algorithm: 'RS256'
    }
   
    return {
        jwtToken: Jwt.sign(payload, RsaKey.privateKey, signOpts)
    }
}

/* 
    Generates a random string of 64 bytes 
*/
function genRefreshToken() 
{
    return Crypto.randomBytes(64).toString('base64');
}

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
}

