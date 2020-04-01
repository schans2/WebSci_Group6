// Currently Just a simple server to serve static files, and to save us from messy directory structure
// You guys can add to the express routing according to your needs

const express = require('express');
var app = express();
var port = 3000;

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

app.post('/login', function(req, res){
    // verify user credentials, and log user in.
    // TO BE IMPLEMENTED
});

app.post('/logout', function(req, res){
    // clear user login status
    // TO BE IMPLEMENTED
})



app.listen(port);
console.log(`Server running on port ${port}`);
