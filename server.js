// Currently Just a simple server to serve static files, and to save us from messy directory structure
// You guys can add to the express routing according to your needs

const express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var uuidv1 = require('uuid').v1;
var cookieParser = require('cookie-parser');
var hashing = require('./server_resources/hashing');
var DatabaseMaster = require('./server_resources/database_master');
const spotify = require("node-spotify-api");
var db_uri = "mongodb+srv://dbUser:ehRb3TNnpKYK2a4Y@cluster0-rebd7.mongodb.net/test?retryWrites=true&w=majority";
var db_master = new DatabaseMaster(db_uri, "Playtwist");

var app = express();
var port = 3000;
var jwt_secret = "VerySecretPassword";
var spot = new spotify({
    id    :"929154c608594196b47f9ac5b3c7d8eb",
    secret:"643827e1934f4491b73a1b79ec8c37b3"
});

var localLogin;

// Utility Functions
/**
 * Authenticates user before a user action. If user is authenticated, proceed with the request.
 * If not, the user will be sent to the register and login page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var authenticate = function(req, res, next){
    var cookies = req.cookies;
    if(cookies == null || cookies.user_token == null){
        // User first time access, bring user to the setup page
        res.redirect("/login");
    }
    else{
        // verify user token
        if(jwt.verify(cookies.user_token, jwt_secret)){
            next();
        }
        else{
            res.redirect("/login");
        }
    }
}

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());
app.use(cookieParser());
// Public static files to serve
app.use('/resources', express.static('resources'));

// Routing to serve pages
app.get('/player/:code', function(req, res){
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

// Spotify search and return
app.get("/search", function(req, res) {
	//console.log("Query = " + req.query.query);
	spot.search({ type : "track", query : req.query.query, limit : 15 }).then(function(response) {
		console.log(response);
		res.send(response);
	}).catch(function(err) {
		console.log("\x1b[31m" + err + "\x1b[0m");
		res.send(err);
	});
});

app.get("/infograb", function(req, res) {
    if(localLogin) { res.send(localLogin); }
    else { res.send("No login"); }
});

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
    var uuid = uuidv1();
    // console.log(`Register request of ${fname} ${lname}, email ${email}, username ${uname}`);
    
    var hashed = hashing.hashIt(pass);
    // console.log(`Hashed password ${hashed.passwordHash} with salt ${hashed.salt}.`);
    
    var query = {
        _id: uuid,
        fname: fname,
        lname: lname,
        email: email,
        uname: uname,
        hash: hashed.passwordHash,
        salt: hashed.salt
    }
    db_master.insertDocument("Users", query, function(result){
        res.send({
            error: false,
            message: "Register Success!"
        });
    });
});

app.post('/login', function(req, res){
    // verify user credentials. Set user cookie and update database statuss    
    var body = req.body;
    var uname = body.uname;
    var pass = body.pass;
    console.log(`User ${uname} attempts to login.`);
    // Fetch user info from database
    var query = { uname: { $eq: uname }};
    db_master.findDocument("Users", query, function(result){
        if(result == null){
            var message = {
                error: true,
                message: "Error: Username not found."
            }
            res.send(message);
        }
        else{
            if(hashing.validate(pass, result.hash, result.salt)){
                var message = {
                    error: false,
                    message: "Validation success!"
                }
                localLogin = result.uname;
                var token = jwt.sign({user_id: result._id}, jwt_secret);
                res.cookie("user_token", token);
                console.log("Set user token to ", result._id);
                res.send(message);
            }
            else{
                // We specify what is wrong during development. Later we change this to "username or password incorrect"
                var message = {
                    error: true,
                    message: "Error: Password incorrect."
                }
                res.send(message);
            }
        }
    });
});

app.get('/logout', function(req, res){
    res.clearCookieres.clearCookie("user_token");
    localLogin = null;
    res.send({
        error: false,
        status: localLogin,
        message: "Logout Success!"
    });
});

app.get("/checkStatus", function(req, res){
    var status = {
        status: localLogin
    }
    res.send(status);
});

app.post('/createPlaylist', function(req, res){
    console.log(req.body);
    var id = req.body.id;
    var joinCode = req.body.joinCode;

    var query = {
        id: id,
        joinCode: joinCode
    }
    db_master.insertDocument("Playlists", query, function(result){
        res.send("Playlist Created!");
    });

});

//save playlist
app.post('/savePlaylist', authenticate, function(req,res){
    var id = Math.floor(100000 + Math.random() * 900000);
    jwt.verify(token, jwt_secret, function(err, decoded) {
        if(err) return;
        var user_id = decoded.user_id;
        var body = req.body;
        var tracks = body.tracks;
        var is_private = body.isPrivate;
        var query = {
            id: id,
            owner: user_id,
            private: is_private,
            tracks: tracks,
            members: [
                user_id
            ]
        }
        db_master.insertDocument("Playlists", query, function(result){
            res.send("Playlist Saved!");
        });
    });
    
});

app.post("/joinGroup", function(req, res){
    var code = req.body.joinCode;
    var query = { joinCode: { $eq: code } };
    db_master.findDocument("Playlists", query, function(result){
        if(!result){
            // Playlist Not found
            var message = {
                error: true,
                message: "Cannot find playlist."
            }
            res.send(message);
        }
        else{
            // Playlist Found
            var message = {
                error: true,
                message: "Cannot find playlist."
            }
            res.send(message);
        }
    });
});

app.get("/getGroup", function(req, res){
    var body = req.body;
    var code = body.code;
    console.log(code);
    var query = {
        joinCode: code
    }
    db_master.findDocument("Playlists", query, function(result){
        res.send(result);
    });
});

app.listen(port);
console.log(`\x1b[32mServer running on port ${port}\n\x1b[33mPress CTRL + C to shut down\x1b[0m`);
