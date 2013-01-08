var Dictionary = require('./Dictionary');
var Tiles = require('./Tiles');

/**
 * Constants
 */
var START_DELAY = 10;
var TURN_DELAY = 5;
var END_DELAY = 20;
var MIN_WORD_LEN = 3;

/**
 * @param {GameRoom} the room this game is being played in
 * @param {Array} ary of player sockets
 */
function Snatch(room, players) {
  this.room = room;
  this.players = players;
  this._curPlayerIdx = 0;
  this._upTiles = new Tiles();
  this._downTiles = new Tiles();
  this._downTiles.reset();
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

Snatch.prototype.currentPlayer = function() {
  return this.players[this._curPlayerIdx];
};

Snatch.prototype.startCountdown = function(evt, total, callback) {
  var self = this;
  function countdown(t) {
    console.log('COUNTDOWN TO ' + evt + ': ' + t);
    self.room.announce('countdown', {
      to: evt,
      time_left: t
    });
    if (t <= 0) {
      callback();
    } else {
      self._countdownTimer = setTimeout(function() {
        countdown(t-1);
      }, 1000);
    }
  }
  countdown(total);
};

Snatch.prototype.startTurn = function() {
  var name = this.currentPlayer().name;
  this.room.announce('whosturn', name);
  
  var self = this;
  this.startCountdown('endturn', TURN_DELAY, function() {
    // Automatically flip a tile because you're too damn slow
    self.transition('flip', {playername: name});
  });
};

Snatch.prototype._checkAttempt = function(data) {
  if (data.attempt.length < MIN_WORD_LEN ||
      !Dictionary.isWord(data.attempt)) {
    return;
  }
  var i, playerIdx;
  for (i = 0; i < this.players.length; ++i) {
    if (this.players[i].name === data.playername) {
      playerIdx = i;
      break;
    }
  }
  var counts = new Tiles(data.attempt);
  // Try making a word only from available tiles
  try {
    this._upTiles = Tiles.take(this._upTiles, counts);
    this._words[playerIdx].push(data.attempt);
    var players = {};
    for (i = 0; i < this.players.length; ++i) {
      players[this.players[i].name] = this._words[i];
    }
    this.room.announce('updateboard', {
      whosturn: this.currentPlayer().name,
      tilesonboard: this._upTiles.getLetters(),
      players: players
    });
  } catch(err) {
  }
};

Snatch.prototype.transition = function(action, data) {
  switch (this._state) {

    /* Countdown before game begins */
    case 'pregame':
      if (action === 'start') {
        var i, self = this;
        function moveListener(data) {
          self.transition(data.action, data);
        }
        this._moveListener = moveListener;
        for (i = 0; i < this.players.length; ++i) {
          this.players[i].socket.on('makemove', moveListener);
        }
        this._state = 'ingame';
        this.startTurn();
      }
      break;

    /* Waiting for next player to flip a tile */
    case 'ingame':
      switch (action) {
        case 'flip':
          if (data.playername === this.currentPlayer().name) {
            clearTimeout(this._countdownTimer);
            var letter = this._downTiles.removeRandomTile();
            this.room.announce('newletter', letter);
            this._upTiles.addTile(letter);
            
            if (this._downTiles.isEmpty()) {
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
          var i;
          for (i = 0; i < this.players.length; ++i) {
            this.players[i].socket
              .removeListener('makemove', this._moveListener);
          }
          this._state = 'postgame';
          break;
        case 'attempt':
          this._checkAttempt(data);
          break;
      }
      break;

    /* Game over! */
    case 'postgame':
      this.room.gameOver();
      break;
  }
};

module.exports = Snatch;
