// Routing: 
//     Pages: homepage, profile page, playlist page
//     APIs: search for songs API, add/change playlist API

const app = require('express')();  // This is actually a simplification of express = require('express'), and then app = express()
const https = require('https');
const http = require('http');
const request = require('request');  // Since we are not using Promise-based APIs, we are using Request over Axios.

var client_id = 'd26cbce7996941a29fc11401be4ecb98';  // Your client id
var client_secret = 'a66d2b0d602b4d439fbae508e0597ff5';  // Your secret, be sure to delete this part when making public!
var redirect_uri = 'http://localhost:8888/callback';  // Your redirect uri








// Webpage Routing



console.log('Listening on 8888');
app.listen(8888);