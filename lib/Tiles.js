var A_CODE = 'A'.charCodeAt(0);
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

/**
 * @param {String} str from which to build a tile count
 */
function Tiles(str) {
  if (typeof str === 'undefined') {
    str = '';
  }
  var i;
  this.str = str;
  this.counts = [];
  for (i = 0; i < NUM_LETTERS; ++i) {
    this.counts.push(0);
  }
  for (i = 0; i < str.length; ++i) {
    letterIdx = str.charCodeAt(i) - A_CODE;
    this.counts[letterIdx]++;
  }
}

Tiles.take = function(src, toTake) {
  var tiles = new Tiles();
  var i;
  for (i = 0; i < NUM_LETTERS; ++i) {
    tiles.counts[i] = src.counts[i] - toTake.counts[i];
    if (tiles.counts[i] < 0) {
      throw "Not enough tiles";
    }
  }
  var temp = toTake.clone();
  var letter_idx, new_str = [];
  for (i = 0; i < src.str.length; ++i) {
    letter_idx = src.str.charCodeAt(i) - A_CODE;
    if (temp.counts[letter_idx] > 0) {
      temp.counts[letter_idx]--;
    } else {
      new_str.push(src.str.charAt(i));
    }
  }
  tiles.str = new_str.join('');
  return tiles;
};

Tiles.prototype.isEmpty = function() {
  return this.str.length === 0;
};

Tiles.prototype.getLetters = function() {
  return this.str.split('');
};

Tiles.prototype.copy = function(orig) {
  for (i = 0; i < NUM_LETTERS; ++i) {
    this.counts[i] = orig.counts[i];
  }
  this.str = orig.str;
  return this;
};

Tiles.prototype.clone = function() {
  return (new Tiles()).copy(this);
};

Tiles.prototype.reset = function() {
  var i, letter, ltrs = [];
  for (letter in TILE_COUNTS) {
    i = letter.charCodeAt(0) - A_CODE;
    this.counts[i] += TILE_COUNTS[letter];
    for (i = 0; i < TILE_COUNTS[letter]; ++i) {
      ltrs.push(letter);
    }
  }
  this.str = ltrs.join('');
  return this;
};

Tiles.prototype.addTile = function(letter) {
  var letterIdx = letter.charCodeAt(0) - A_CODE;
  this.counts[letterIdx]++;
  this.str += letter;
};

Tiles.prototype.removeRandomTile = function() {
  var i, choose, letter;
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
  letter = String.fromCharCode(choose + A_CODE);
  this.str.split('').splice(this.str.indexOf(letter), 1).join('');
  return letter;
};

module.exports = Tiles;
