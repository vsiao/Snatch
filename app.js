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

var Game = require('./lib/Game')(app);
var players = {};
var games = {};

function buildRoomData() {
  var rooms = [];
  var i, room, room_id, clients;
  for (room_id in io.sockets.manager.rooms) {
    room = {room_id: room_id, users: []};
    clients = io.sockets.manager.rooms[room_id];
    for (i = 0; i < clients.length; ++i) {
      if (players.hasOwnProperty(clients[i]) &&
          players[clients[i]].status != 'waiting') {
        room.users.push(players[clients[i]].playername);
      }
    }
    rooms.push(room);
  }
  return rooms;
}

var socketEventHandlers = {
  updateplayer: function(data) {
    var i;
    for (i = 0; i < data.changed.length; ++i) {
      switch (data.changed[i]) {
        case 'name':
          /* Player changed name */
          break;
        case 'status':
          /* waiting | ready | playing */
          break;
      }
    }
  },
  makemove: function(data) {
    switch (data.action) {
      case 'flip':
        break;
      case 'attempt':
        break;
    }
  }
};

app.io = SocketIO.listen(server);
app.io.sockets.on('connection', function(socket) {
  var evt;
  for (evt in socketEventHandlers) {
    socket.on(evt, socketEventHandlers[evt]);
  }
});

app.get('/', function(req, res) {
  res.render('index', {rooms: buildRoomData()});
});

app.get('/rooms/:room_id', function(req, res) {
  res.render('rooms', {room_id: req.params.room_id});
});

