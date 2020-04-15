// Currently Just a simple server to serve static files, and to save us from messy directory structure
// You guys can add to the express routing according to your needs

const express = require('express');
var bodyParser = require('body-parser');
var hashing = require('./server_resources/hashing');
var DatabaseMaster = require('./server_resources/database_master');
const spotify = require("node-spotify-api");
var db_uri = "mongodb+srv://dbUser:ehRb3TNnpKYK2a4Y@cluster0-rebd7.mongodb.net/test?retryWrites=true&w=majority";
var db_master = new DatabaseMaster(db_uri, "Playtwist");

var app = express();
var port = 3000;
var spot = new spotify({
    id    :"929154c608594196b47f9ac5b3c7d8eb",
    secret:"643827e1934f4491b73a1b79ec8c37b3"
});

app.use(bodyParser.urlencoded({ extended : false }));
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
    
    var hashed = hashing.hashIt(pass);
    console.log(`Hashed password ${hashed.passwordHash} with salt ${hashed.salt}.`);
    
    var query = {
        fname: fname,
        lname: lname,
        email: email,
        uname: uname,
        hash: hashed.passwordHash,
        salt: hashed.salt
    }
    db_master.insertDocument("Users", query, function(result){
        res.send("Register success!");
    });
});
var localLogin = false;
app.post('/login', function(req, res){
    // verify user credentials, and log user in.
    
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
                localLogin = true;
                res.send(message);
                // Do some success stuff
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

app.post('/logout', function(req, res){
    // clear user login status
    // TO BE IMPLEMENTED
    var body = req.body;
    var uname = body.uname;
    var token = bdoy.token;
    // Validates username and user login token(stored at user's as part of cookie).
    console.log(`User ${uname} logs out.`);
});

app.get("/checkStatus", function(req, res){
    var status = {
        status: localLogin
    }
    res.send(status);
});
//==================================================
app.post('/newUser', function(req, res){
    console.log(req.body);
    var user = req.body;
    // var user = JSON.stringify(req.body);

    // MongoClient.connect(conn, function(err, db){
    //     if(err) throw err;
    //     var dbo = db.db("playtwist");
    //     dbo.collection("users").insertOne(user, function(err, res){
    //         if (err) throw err;
    //         console.log("Data inserted");
    //         db.close();
    //     });
    
    // });


});
//========================================

app.post('/createGroup', function(req, res){
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
var code = "";
app.post("/joinGroup", function(req, res){
    code = req.body.joinCode;
    // console.log(code);
});

app.get("/getGroup", function(req, res){
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