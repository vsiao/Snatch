var Consolidate = require('consolidate');
var Express = require('express');
var Path = require('path');
var SocketIO = require('socket.io');

var app = Express();
app.use(Express.static(Path.join(__dirname, 'public')));
app.engine('dust', Consolidate.dust);
app.set('view engine', 'dust');
app.set('views', Path.join(__dirname, 'views'));

var port = process.env.PORT || 8080;
var server = app.listen(port, function() {
  console.log("Listening on port %d in %s mode", port, app.settings.env);
});

var io = SocketIO.listen(server);
io.sockets.on('connection', function(socket) {
  socket.emit('hello', {data: 'world'});
  socket.on('goodbye', function(data) {
    console.log(data);
  });
});

app.get('/rooms/:room_id', function(req, res) {
  res.render('rooms', {room_id: req.params.room_id});
});
