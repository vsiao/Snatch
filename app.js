var express = require('express');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

var port = process.env.PORT || 8080;
var server = app.listen(port, function() {
  console.log("Listening on port %d in %s mode", port, app.settings.env);
});

var io = socketIO.listen(server);
io.sockets.on('connection', function(socket) {
  socket.emit('hello', {data: 'world'});
  socket.on('goodbye', function(data) {
    console.log(data);
  });
});
