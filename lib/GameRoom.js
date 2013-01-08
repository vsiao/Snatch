var EventEmitter = require('events').EventEmitter;
var SnatchGame = require('./Snatch');

var PLAYER_LIMIT = 2;

/**
 * @param {String} room_id of the socket.io room
 */
function GameRoom(room_id) {
  console.log('New room "' + room_id + '" created');
  this.state = 'waiting';
  this.room_id = room_id;
  this.playersBySocketId = {};
  this.playerQueue = [];
}

GameRoom.prototype.__proto__ = EventEmitter.prototype;

GameRoom.prototype.addPlayer = function(player) {
  player.socket.join(this.room_id);
  this.playersBySocketId[player.socket.id] = player;
  console.log(player.socket.id + ' has entered room "' + this.room_id + '"');

  var self = this;
  function addPlayerToQueue() {
    self.playerQueue.push(player);
    self.checkRoomStatus();
  }
  player.once('ready', addPlayerToQueue);
};

GameRoom.prototype.removePlayer = function(player) {
  var i, socket_id;
  player.socket.leave(this.room_id);
  delete this.playersBySocketId[player.socket.id];
  console.log(player.socket.id + ' has left room "' + this.room_id + '"');
  for (i = 0; i < this.playerQueue.length; ++i) {
    if (this.playerQueue[i].socket.id === player.socket.id) {
      this.playerQueue.splice(i, 1);
    }
  }

  // Check if the room is empty
  for (socket_id in this.playersBySocketId) {
    return;
  }
  this.emit('empty');
};

GameRoom.prototype.getPlayerNames = function() {
  var socket_id, player;
  var names = [];
  for (socket_id in this.playersBySocketId) {
    player = this.playersBySocketId[socket_id];
    if (player.name) {
      names.push(player.name);
    }
  }
  return names;
};

GameRoom.prototype.checkRoomStatus = function() {
  switch (this.state) {
    case 'waiting':
      if (this.playerQueue.length >= PLAYER_LIMIT) {
        console.log('New game started in room "' + this.room_id + '"');
        this.game = new SnatchGame(this,
          this.playerQueue.slice(0, PLAYER_LIMIT));
        this.state = 'playing';
      }
      break;
    case 'playing':
      break;
  }
};

GameRoom.prototype.gameOver = function() {
  // FIXME(vsiao) lol nothing happens
  // go away; make a new room or something
};

module.exports = function(app) {
  GameRoom.prototype.announce = function(evt, data) {
    app.io.sockets.in(this.room_id).emit(evt, data);
  };
  return GameRoom;
}
