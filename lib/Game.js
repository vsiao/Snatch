var Dictionary = require('./Dictionary');
var Tiles = require('./Tiles');

/**
 * Constants
 */
var START_DELAY = 10;
var TURN_DELAY = 15;
var END_DELAY = 20;

/**
 * @param {String} id of the game room
 * @param {Array} ary of player sockets
 */
function Game(room_id, players) {
  this.room_id = room_id;
  this.players = players;
  this._curPlayerIdx = 0;
  this._downTiles = (new Tiles()).reset();
  this._upTiles = new Tiles();
  this._state = 'pregame';
  this._words = [];
  var i;
  for (i = 0; i < players.length; ++i) {
    this._words.push([]);
  }
  var self = this;
  this.startCountdown('start', START_DELAY, function() {
    self.transition('start');
  });
}

Game.prototype.currentPlayer = function() {
  return this.players[this._curPlayerIdx];
};

Game.prototype.startCountdown = function(evt, total, callback) {
  function countdown(t) {
    this.announce('countdown', {
      to: evt,
      time_left: t
    });
    if (t <= 0) {
      callback();
    }
    setTimeout(function() {
      countdown(t-1);
    }, 1000);
  }
  countdown(total);
};

Game.prototype.startTurn = function() {
  var current_player = this.currentPlayer();
  current_player.emit('yourturn');
  
  var self = this;
  this._turnTimer = this.startCountdown('endturn', TURN_DELAY, function() {
    // Automatically flip a tile because you're too damn slow
    self.transition('flip', {player_id: current_player.id});
  });
};

Game.prototype._checkAttempt = function(data) {
  var counts = new Tiles(data.attempt);
};

Game.prototype.transition = function(action, data) {
  switch (this._state) {

    /* Countdown before game begins */
    case 'pregame':
      if (action === 'start') {
        this._state = 'ingame';
        this.startTurn();
      }
      break;

    /* Waiting for next player to flip a tile */
    case 'ingame':
      switch (action) {
        case 'flip':
          if (data.player_id === this.currentPlayer().id) {
            clearTimeout(this._turnTimer);
            var letter = this._downTiles.removeRandomTiles();
            this.broadcast('newletter', letter);
            this._upTiles.addTile(letter);
            
            if (noMoreLetters(this._downTiles)) {
              var self = this;
              this._state = 'endgame';
              this.startCountdown('end', END_DELAY, function() {
                self.transition('end');
              });
            } else {
              this._curPlayerIdx = (++this._curPlayerIdx) % this.players.length;
              this.startTurn();
            }
          }
          break;
        case 'attempt':
          this._checkAttempt(data);
          break;
      }
      break;

    /* Countdown after last tile is flipped */
    case 'endgame':
      switch (action) {
        case 'end':
          this._state = 'postgame';
          break;
        case 'attempt':
          this._checkAttempt(data);
          break;
      }
      break;

    /* Game over! */
    case 'postgame':
      break;
  }
};

module.exports = function(app) {
  Game.prototype.announce = function(evt, data) {
    app.io.sockets.in(this.room_id).emit(evt, data);
  };
  return Game;
};
