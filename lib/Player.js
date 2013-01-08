var EventEmitter = require('events').EventEmitter;

/**
 * @param {Socket} socket of the player
 */
function Player(socket) {
  this.socket = socket;
  this.name = null;

  var self = this;
  socket.on('updatename', function(name) {
    console.log(self.socket.id + ' is now named "' + name + '"');
    self.name = name;
  });
}

Player.prototype.__proto__ = EventEmitter.prototype;

Player.prototype.enter = function(room) {
  this.room = room;
  this.ready = false;
  this.room.addPlayer(this);

  var self = this;
  this.socket.on('ready', function() {
    console.log('"' + self.name + '" is ready to play');
    self.ready = true;
    self.emit('ready');
  });
};

Player.prototype.exit = function() {
  if (this.room) {
    this.room.removePlayer(this);
    this.room = null;
  }
};

module.exports = Player;
