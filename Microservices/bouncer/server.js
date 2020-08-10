//////////////////////////////////////////////
////////////// Global Variables //////////////
//////////////////////////////////////////////
require("dotenv").config();

const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const rsaKeys = generateRandomToken();

var  = new Map();

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//////////////////////////////////////////////
/////////////////// Config ///////////////////
//////////////////////////////////////////////
app.listen(process.env.PORT, () => {

});



//////////////////////////////////////////////
///////////////// Routes  ////////////////////
//////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/auth', (req, res) => {
    var jwtToken = jwt.sign({ foo: 'bar' }, rsaKeys.privateKey, { algorithm: 'RS256'});
    res.json(jwtToken);
});


//////////////////////////////////////////////
///////////// Helper Functions ///////////////
//////////////////////////////////////////////
function generateRandomToken() {
    return { publicKey, privateKey } = require("crypto").generateKeyPairSync("rsa", {
        modulusLength: 2048,
    });
}