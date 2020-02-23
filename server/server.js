// Routing: 
//     Pages: homepage, profile page, playlist page
//     APIs: search for songs API, add/change playlist API

const app = require('express')();  // This is actually a simplification of express = require('express'), and then app = express()
const https = require('https');
const http = require('http');

// Webpage Routing