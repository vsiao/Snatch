var NUM_LETTERS = 26;
var TILE_COUNTS = {
  E: 12, A: 9, I: 9, O: 8, N: 6, R: 6, L: 4, S: 4, U: 4,
  D: 4,  G: 3,
  B: 2,  C: 2, M: 2, P: 2,
  F: 2,  H: 2, V: 2, W: 2, Y: 2,
  K: 1,
  J: 1,  X: 1,
  Q: 1,  Z: 1
};

function Tiles(word) {
  if (typeof word === 'undefined') {
    word = '';
  }
  var i;
  this.counts = [];
  for (i = 0; i < NUM_LETTERS; ++i) {
    this.counts.push(0);
  }
  for (i = 0; i < word.length; ++i) {
    letterIdx = word.toCharCode(i) - 'A'.toCharCode(0);
    this.counts[letterIdx]++;
  }
}

Tiles.prototype.isEmpty = function() {
  var i;
  for (i = 0; i < NUM_LETTERS; ++i) {
    if (this.counts[i] > 0) {
      return false;
    }
  }
  return true;
};

Tiles.prototype.reset = function() {
  var i, letter;
  for (letter in TILE_COUNTS) {
    i = letter.toCharCode(0) - 'A'.toCharCode(0);
    this.counts[i] += TILE_COUNTS[letter];
  }
};

Tiles.prototype.addTile = function(letter) {
  var letterIdx = letter.toCharCode(0) - 'A'.toCharCode(0);
  this.counts[letterIdx]++;
};

Tiles.prototype.removeRandomTile = function() {
  var i, choose;
  var seen = 0;
  for (i = 0; i < NUM_LETTERS; ++i) {
    if (this.counts[i] <= 0) {
      continue;
    }
    seen += this.counts[i]
    if (Math.random() < this.counts[i] / seen) {
      choose = i;
    }
  }
  this.counts[choose]--;
  return choose;
};

return Tiles;
