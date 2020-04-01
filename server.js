// Currently Just a simple server to serve static files, and to save us from messy directory structure
// You guys can add to the express routing according to your needs

const express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var app = express();
var port = 3000;

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
// Public static files to serve
app.use('/resources', express.static('resources'));

// Routing to serve pages
app.get('/player', function(req, res){
    res.sendFile(__dirname + "/music_player.html");
});

app.get('/', function(req, res){
    res.sendFile(__dirname + "/homePage.html");
});

app.get('/friends', function(req, res){
    res.sendFile(__dirname + "/friendPage.html");
});

app.get('/login', function(req, res){
    res.sendFile(__dirname + "/login.html");
});

app.get('/user', function(req, res){
    res.sendFile(__dirname + "/userPage.html");
});


// Temporary space for crypto functions. Will be moved to an external module soon.
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

// API calls to the server
app.post('/join', function(req, res){
    // verify user login status, join user to a group, and redirect.
    var body = req.body;
    var uname = body.uname;
    var token = body.token;
    return
});

app.post('/register', function(req, res){
    // get Register info from user, validate user credentials before storing to database and return success
    var body = req.body;
    var fname = body.fname;
    var lname = body.lname;
    var email = body.email;
    var uname = body.uname;
    var pass = body.pass;
    console.log(`Register request of ${fname} ${lname}, email ${email}, username ${uname}`);
    
    var salt = genRandomString(16);
    var hashed = sha512(pass, salt);
    console.log(`Hashed password ${hashed.passwordHash} with salt ${hashed.salt}.`);
    // <<VALIDATION AND DATABASE TO BE IMPLEMENTED>>

    res.send("Register handling success!");
});

app.post('/login', function(req, res){
    // verify user credentials, and log user in.
    var body = req.body;
    var uname = body.uname;
    var pass = body.pass;
    console.log(`User ${unmae} attempts to login.`);
});

app.post('/logout', function(req, res){
    // clear user login status
    // TO BE IMPLEMENTED
    var body = req.body;
    var uname = body.uname;
    var token = bdoy.token;
    // Validates username and user login token(stored at user's as part of cookie).
    console.log(`User ${uname} logs out.`);
});

app.listen(port);
console.log(`Server running on port ${port}`);
