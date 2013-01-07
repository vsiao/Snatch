var Consolidate = require('consolidate');
var Express = require('express');
var Path = require('path');
var SocketIO = require('socket.io');
var app = Express();

var GameRoom = require('./lib/GameRoom')(app);
var Player = require('./lib/Player');
var rooms = {};
var players = {};

app.use(Express.static(Path.join(__dirname, 'public')));
app.engine('dust', Consolidate.dust);
app.set('view engine', 'dust');
app.set('views', Path.join(__dirname, 'views'));

var port = process.env.PORT || 8080;
var server = app.listen(port, function() {
  console.log("Listening on port %d in %s mode", port, app.settings.env);
});

app.io = SocketIO.listen(server);
app.io.sockets.on('connection', function(socket) {
  socket.on('roomenter', function(room_id) {
    if (!players.hasOwnProperty(socket.id)) {
      players[socket.id] = new Player(socket);
    }
    if (!rooms.hasOwnProperty(room_id)) {
      rooms[room_id] = new GameRoom(room_id);
      rooms[room_id].once('empty', function() {
        delete rooms[room_id];
      });
    }
    players[socket.id].enter(rooms[room_id]);
  });

  socket.on('disconnect', function() {
    if (players.hasOwnProperty(socket.id)) {
      players[socket.id].exit();
    }
  });
});

function buildRoomData() {
  var data = [];
  var i, room_id;
  for (room_id in rooms) {
    data.push({
      room_id: room_id,
      users: rooms[room_id].getPlayerNames()
    });
  }
  return data;
}

app.get('/', function(req, res) {
  res.render('index', {rooms: buildRoomData()});
});

app.get('/rooms/:room_id', function(req, res) {
  res.render('rooms', {room_id: req.params.room_id});
});
