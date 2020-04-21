var express = require('express'),
    app = express(),
    http = require('http');

app.get('/', function (req, res) {
    res.send("Hello World One");
});

server = http.Server(app);
var io = require('socket.io').listen(server);
server.listen(5000);