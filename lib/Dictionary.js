var Path = require('path');
var fs = require('fs');
var dict = [];

fs.readFile(Path.join(__dirname, 'TWL06-4plus.txt'), function(err, data) {
  if (err) {
    throw err;
  }
  dict = data.toString().split(/\r\n|\r|\n/g);
});

function binsearch(str, lo, hi) {
  if (lo >= hi) {
    return false;
  }
  var mid = lo + Math.floor((hi-lo)/2);
  if (dict[mid] == str) {
    return true;
  } else if (dict[mid] < str) {
    return binsearch(str, mid+1, hi);
  } else {
    return binsearch(str, lo, mid-1);
  }
}

module.exports = {
  isWord: function(str) {
    return binsearch(str, 0, dict.length);
  },
};
