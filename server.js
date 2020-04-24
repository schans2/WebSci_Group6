// Currently Just a simple server to serve static files, and to save us from messy directory structure
// You guys can add to the express routing according to your needs

const express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var uuidv1 = require('uuid').v1;
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var hashing = require('./server_resources/hashing');
var DatabaseMaster = require('./server_resources/database_master');
const spotify = require("node-spotify-api");
var db_uri = "mongodb+srv://dbUser:ehRb3TNnpKYK2a4Y@cluster0-rebd7.mongodb.net/test?retryWrites=true&w=majority";
var db_master = new DatabaseMaster(db_uri, "Playtwist", function(){
    // Delete Expired Unregistered Users
    var current_time = new Date().getTime()/1000;  // In seconds
    db_master.deleteDocuments("Users", { expiresAt: { $lt: current_time } });
});

var app = express();
var http_server = require('http').Server(app);
var io = require('socket.io')(http_server);
var port = 3000;
var jwt_secret = "VerySecretPassword";
var spot = new spotify({
    id    :"929154c608594196b47f9ac5b3c7d8eb",
    secret:"643827e1934f4491b73a1b79ec8c37b3"
});


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
        jwt.verify(cookies.user_token, jwt_secret, function(err, decoded){
            if(err) res.redirect("/login");
            else if(decoded.registered) next();
            else res.redirect("/login");
        });
    }
}

/**
 * If the user comes without a cookie and (obviously) not logged in, give him a temp cookie that lasts 30 minutes.
 * Info is saved to db 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var assignGuestCookie = function(req, res, next){
    var cookies = req.cookies;
    var token = cookies.user_token;
    var new_user_id = uuidv1();
    var expiresAt = new Date().getTime()/1000 + 18; // In seconds
    var new_token = jwt.sign({user_id: new_user_id, registered: false, expiresAt: expiresAt}, jwt_secret);
    var new_query = {
        _id: new_user_id,
        expiresAt: expiresAt
    }
    if(cookies == null || cookies.user_token == null){
        //console.log("No cookie. Assigning new cookie.");
        res.cookie("user_token", new_token);
        db_master.insertDocument("Users", new_query);
        next();
    }
    else{
        // verify user token
        jwt.verify(cookies.user_token, jwt_secret, function(err, decoded){
            if(err){
                //console.log("Invalid cookie. Assigning new cookie.");
                res.cookie("user_token", new_token);
                db_master.insertDocument("Users", new_query);
                next();
            }
            else if(decoded.expiresAt < new Date().getTime()){
                //console.log("Temporary cookie expired. Assigning new cookie.");
                res.cookie("user_token", new_token);
                db_master.insertDocument("Users", new_query);
                next();
            }
            else{
                next();
            }
        });
    }
}

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());
app.use(cookieParser());
// Public static files to serve
app.use('/resources', express.static('resources'));

// Routing to serve pages
app.get('/player/:code', assignGuestCookie, function(req, res){
    res.sendFile(__dirname + "/music_player.html");
});

app.get('/', assignGuestCookie, function(req, res){
    res.sendFile(__dirname + "/homePage.html");
});

app.get('/friends', function(req, res){
    res.sendFile(__dirname + "/friendPage.html");
});

app.get('/login', function(req, res){
    res.sendFile(__dirname + "/login.html");
});

app.get('/user', authenticate, function(req, res){
    res.sendFile(__dirname + "/userPage.html");
});

// Spotify search and return
app.get("/search", function(req, res) {
	//console.log("Query = " + req.query.query);
	spot.search({ type : "track", query : req.query.query, limit : 15 }).then(function(response) {
		//console.log(response);
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
        salt: hashed.salt,
        ownsPlaylist: [],
        joinedPlaylist: []
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
                var token = jwt.sign({user_id: result._id, registered: true}, jwt_secret);
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
    var cookies = req.cookies;
    if(cookies == null || cookies.user_token == null){
        res.end();
    }
    res.clearCookie("user_token");
    res.clearCookie("registered");
    res.send({
        error: false,
        message: "Logout Success!"
    });
});

/**
 * This endpoint verifies user login status and returns username if logged in. Else return null.
 */
app.get("/checkStatus", function(req, res){
    var cookies = req.cookies;
    if(cookies == null || cookies.user_token == null){
        var message = {
            error: false,
            loginStatus: null
        }
        res.send(message);
    }
    else{
        var token = cookies.user_token;
        jwt.verify(token, jwt_secret, function(err, decoded) {
            if(err){
                var message = {
                    error: false,
                    loginStatus: null
                }
                res.send(message);
            }
            else{
                var user_id = decoded.user_id;
                console.log(decoded, user_id)
                var query = { _id: { $eq: user_id } };
                db_master.findDocument("Users", query, function(result){
                    if(!result){
                        var message = {
                            error: false,
                            loginStatus: null
                        };
                        res.send(message);
                    }
                    else{
                        var message = {
                            error: false,
                            loginStatus: result.uname
                        };
                        res.send(message);
                    }
                });
            }
        });
    }
});

app.get('/createPlaylist', function(req, res){
    var cookies = req.cookies;
    var token = cookies.user_token;
    var id = Math.floor(100000 + Math.random() * 900000);
    var ans = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for(var i = 0; i < 6; i++){
        ans += characters.charAt(Math.floor(Math.random()* charactersLength));
    }
    jwt.verify(token, jwt_secret, function(err, decoded) {
        if(err) return;
        var user_id = decoded.user_id;
        var query = {
            id: id,
            owner: user_id,
            joinCode:ans,
            private: true,
            tracks: [],
            members: [
                user_id
            ]
        }
        db_master.insertDocument("Playlists", query, function(result){
            var message = {
                error: false,
                message: "craete playlist.",
                playlist_id:id,
                joinCode:ans
            }
            res.send(message);
        });
    });

});

//get current user information
app.get('/getUserownsPlaylist',authenticate,function(req,res){
    var cookies = req.cookies;
    var token = cookies.user_token;
    jwt.verify(token,jwt_secret,function(err,decoded){
        if(err) return;
        var user_id = decoded.user_id;
        var query = {
            _id: user_id,
        }
        db_master.findDocument("Users", query, function(result){
            res.send(result);
        });
    })
});

//get the first song's album
app.post('/getAlbum',function(req,res){
    var playlistID = req.body.id;
    //console.log("input id:"+playlistID);
    var query = {
        id: playlistID
    }
    db_master.findDocument("Playlists",query,function(result){
        if(!result){
            console.log("Cannot find playlist");
            return;
        }
        else if (result.tracks == undefined || result.tracks.length < 1){
            console.log("Empty playlist");
            var message = {
                error: true,
                playlistId: result.id,
                album: undefined,
                message:"Empty playlist or Cannot find playlist"
            }
            res.send(message);
        }else{
            var firstSong = result.tracks[0];
            if(firstSong["service"] == "spotify"){
                var albumLink = firstSong["album"]["images"][0]["url"];
            }
            else if(firstSong["service"] == "deezer"){
                var albumLink = firstSong["album"]["cover"];
            }
            var message = {
                error: false,
                album: albumLink,
                playlistId: result.id,
                messgae:"Find the Album"
            }
            res.send(message);
        }
    })
})

//save playlist
app.post('/savePlaylist', authenticate, function(req,res){
    var cookies = req.cookies;
    var token = cookies.user_token;
    var playlist_id = Math.floor(100000 + Math.random() * 900000);
    var ans = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for(var i = 0; i < 6; i++){
        ans += characters.charAt(Math.floor(Math.random()* charactersLength));
    }
    jwt.verify(token, jwt_secret, function(err, decoded) {
        console.log(decoded);
        if(err){
            message = {
                error: true,
                message: "Cannot save playlist: login first."
            }
            res.send(message);
            return;
        }
        else if(decoded.registered == false){
            message = {
                error: true,
                message: "Cannot save playlist: login first."
            }
            res.send(message);
            return;
        }
        var user_id = decoded.user_id;
        var body = req.body;
        var tracks = body;
        var query = {
            id: playlist_id,
            owner: user_id,
            joinCode:ans,
            private: true,
            tracks: tracks,
            members: [
                user_id
            ]
        }
        var user_id = decoded.user_id;
        var match_query = { _id: user_id };
        var update_query = { $addToSet: { ownsPlaylist: playlist_id }};
        db_master.updateDocument("Users", match_query, update_query);
        db_master.insertDocument("Playlists", query, function(result){
            res.send({error: false});
        });
    });
    
});

app.post("/joinPlaylist", function(req, res){
    var cookies = req.cookies;
    var token = cookies.user_token;
    var code = req.body.joinCode;
    console.log("Join code: ", code);
    var query = { joinCode: { $eq: code } };
    db_master.findDocument("Playlists", query, function(result){
        if(!result){
            // Playlist Not found
            console.log("Not found")
            var message = {
                error: true,
                message: "Cannot find playlist.",
                playlist_id: undefined
            }
            res.send(message);
        }
        else{
            // Playlist Found
            var playlist_id = result.id;
            var message = {
                error: false,
                message: "Can find playlist.",
                playlist_id: playlist_id
            }
            res.send(message);
            // Update user's profile and Playlist's members
            jwt.verify(token, jwt_secret, function(err, decoded){
                if(err) return;
                if(!decoded.registered) return;
                var user_id = decoded.user_id;
                var match_query = { _id: user_id };
                var update_query = { $addToSet: { joinedPlaylist: playlist_id }};
                db_master.updateDocument("Users", match_query, update_query);
                
                match_query = { id: playlist_id };
                update_query = { $addToSet: { members: user_id }};
                db_master.updateDocument("Playlists", match_query, update_query);
            });
        }
    });
});

app.post("/getGroup", function(req, res){
    var body = req.body;
    var code = body.code;
    code = parseInt(code, 10);
    console.log(code);
    var query = {
        id: code
    }
    db_master.findDocument("Playlists", query, function(result){
        res.send(result);
    });
});

// Socket.io Connections
io.on('connection', function(socket){
    // var cookief =socket.handshake.headers.cookie;
    // var cookies = cookie.parse(cookief);
    var socket_query = socket.handshake.query;
    var playlist_id = parseInt(socket_query.playlistId);
    socket.join(playlist_id);
    // if(cookies.user_token){
    //     console.log("User has cookie: ", cookies.user_token);
    // }
    // else{
    //     console.log("User does not have a cookie.");
    // }
    
    // Send user the playlist on connection as init
    var query = { id: playlist_id };
    console.log(query);
    db_master.findDocument("Playlists", query, function(result){
        if(!result) return;
        // console.log("Initial data empty: ", !result.tracks)
        socket.emit("initialData", result.tracks, result.joinCode);
    });

    socket.on("upvote", function(message){
        var track_id = message;
        socket.broadcast.to(playlist_id).emit("upvote", track_id);
        var match_query = {
            id: playlist_id,
            "tracks.id": track_id
        };
        var update_query = {
            $inc: {
                "tracks.$.upvotes": 1
            }
        };
        db_master.updateDocument("Playlists", match_query, update_query);        
    });

    socket.on("downvote", function(message){
        var track_id = message;
        socket.broadcast.to(playlist_id).emit("downvote", track_id);
        var match_query = {
            id: playlist_id,
            "tracks.id": track_id
        };
        var update_query = {
            $inc: {
                "tracks.$.downvotes": 1
            }
        };
        db_master.updateDocument("Playlists", match_query, update_query);    
    });

    // Everyone can add a track
    socket.on("addTrack", function(message){
        var track_info = message;
        // Remove the "$$hash_key" from track_info since it will mess mongodb up
        delete track_info.$$hashKey;
        socket.broadcast.to(playlist_id).emit("addTrack", track_info);
        var match_query = { id: playlist_id };
        var update_query = { $addToSet: { tracks: track_info }};
        console.log("Update Query: ", update_query);
        db_master.updateDocument("Playlists", match_query, update_query, function(result){
            console.log("Update result: ", result);
        });
    });

    // But only host can delete a track
    socket.on("deleteTrack", function(message){
        return
    });

    // Track finishes playing, update queue on every device. Simply put: remove queue's first element
    socket.on("finishTrack", function(message){
        return
    });

    // Host rewinds playlist, update queue on every device. Simply put: restore previous element on queue
    socket.on("rewindTrack", function(message){
        return
    });

    socket.on('disconnect', function(){
        console.log("A user disconnected.");
        // Save current version to database

    });
    
});

http_server.listen(port);
console.log(`\x1b[32mServer running on port ${port}\n\x1b[33mPress CTRL + C to shut down\x1b[0m`);
