//////////////////////////////////////////////
////////////// Global Variables //////////////
//////////////////////////////////////////////

/* Node Modules */
require('dotenv').config();
const Express = require('express');
const BodyParser = require('body-parser');
const Http = require('axios');

/* JSON body validator */
const Check = require('express-validator').check;
const Validate = require('express-validator').validationResult;

/* JWK/JWT */
const Crypto = require('crypto');
const Jose = require('jose');
//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
const App = Express();

/* Generate a new Jwk on startup */
var MyJwk = genJwk();

/* 
    Stores all users Refresh Tokens 
    Map key is userId, Map value is 
    an array of all refresh tokens
    that the user currently has
*/
var RefreshTokens = new Map();

/* Use Body parser, and catch errors */
App.use((req, res, next) => {
    BodyParser.json({
        verify: addRawBody,
    })(req, res, (err) => {
        if (err) {
            console.log(err);
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
App.listen(process.env.BOUNCER_PORT);
//////////////////////////////////////////////
///////////////// Routes  ////////////////////
//////////////////////////////////////////////

App.post('/auth/login', 
    [
        Check('username').isAlphanumeric(),
        Check('password').isAlphanumeric()
    ],
    async (req, res) => 
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
        var userId = await getUserId(username, password)
        if (userId < 0) {
            return res.status(404).json({'errors': 'Invalid password or username'});
        }

        /* See if User already has a userTokens array */
        var userRefreshTokens = RefreshTokens.get(userId);
        if (userRefreshTokens === undefined) {
            userRefreshTokens = [];
        }

        /* Create a new Refresh Token and add it to the map */
        var newToken = genRefreshToken();
        userRefreshTokens.push(newToken);
        RefreshTokens.set(userId, userRefreshTokens);
        
        /* Return the user's Id and new refresh token */
        return res.json({
            id: userId,
            refreshToken: newToken
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
            return res.status(422).json({ errors: errors.array() });
        }

        /* Grab variables from request body */
        var userId = req.body.userId;
        var refreshToken = req.body.refreshToken;
    
        /* Check if refreshToken is valid */
        var userTokens = RefreshTokens.get(userId);
        if (userTokens === undefined) {
            return res.status(403).json({errors: 'User is not logged in'});
        } 
        else if (userTokens.find(x => x == refreshToken) === undefined) {
            return res.status(403).json({errors: 'Token not found for user'});
        }
    
        return res.json({'jwt': genJwt(userId, "User")});    
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
    }
    return Jose.JWK.generateSync('RSA', 2048, opts)
};
/* 
    Generates a JWT for the user that is valid 
    for 5 minutes 
*/
function genJwt(userId, role)
{
    var payload = {
        "unique_name": userId.toString(),
        "role": role,
      }
    var signOpts = {
        algorithm: 'RS256',
        audience: process.env.JWT_ISSUER,
        expiresIn: '5m',
        iat: true,
        issuer: process.env.JWT_ISSUER,
        subject: userId.toString(),
        audience: userId.toString(),
    }
    return Jose.JWT.sign(payload, MyJwk.toJWK(true), signOpts);
};
/* 
    Generates a random string of 64 bytes 
*/
function genRefreshToken() 
{
    return Crypto.randomBytes(64).toString('base64');
};
/* 
    This function returns the user's userId if 
    username and password were valid. Returns -1
    if user_api response was not 200 OK
*/
function getUserId(username, password)
{
    return Http.post(process.env.USER_API_URL + 'user/verify', {
        Username: username,
        Password: password
    }).then(res => {
        return res.data.id;
    }).catch(err => {
        return -1;
    });
};

function logErrors (err, req, res, next) {
    console.error(err.stack)
    next(err)
};
/*
  This function prints the error into 
  the console log
*/
function addRawBody(req, res, buf, encoding) {
    req.rawBody = buf.toString();
}