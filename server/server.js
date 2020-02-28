// Routing: 
//     Pages: homepage, profile page, playlist page
//     APIs: search for songs API, add/change playlist API

const express = require('express');
var app = express()
const https = require('https');
const http = require('http');
const request = require('request');  // Since we are not using Promise-based APIs, we are using Request over Axios.
var querystring = require('querystring');

var client_id = 'd26cbce7996941a29fc11401be4ecb98';  // Your client id
var client_secret = 'a66d2b0d602b4d439fbae508e0597ff5';  // Your secret, be sure to delete this part when making public!
var redirect_uri = 'http://localhost:8888/spotifyCallback';  // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.get('/spotifyLogin', (req, res) => {
    var state = generateRandomString(16);
    // Not used yet. Need the cookie-parse middleware to modify cookies
    // res.cookie(stateKey, state);

    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        })
    );
});

app.get('/spotifyCallback', (req, res) => {
    
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    // var storedState = req.cookies ? req.cookies[stateKey] : null;

    /*
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
        }));
    } else {
    res.clearCookie(stateKey); */

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            var access_token = body.access_token,
                refresh_token = body.refresh_token;
            console.log("Access Token is: ", access_token);

            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
            console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
            querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
            }));
        } else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    });
    // } This Bracket is for the commented out if else above
});

/*
app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
})*/

app.use(express.static(__dirname));





// Webpage Routing



console.log('Listening on 8888');
app.listen(8888);