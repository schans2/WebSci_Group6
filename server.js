// Currently Just a simple server to serve static files, and to save us from messy directory structure
// You guys can add to the express routing according to your needs

const express = require('express');
var bodyParser = require('body-parser');
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

// API calls to the server
app.post('/join', function(req, res){
    // verify user login status, join user to a group, and redirect.
    // TO BE IMPLEMENTED
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
