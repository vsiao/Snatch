var socket = io.connect('http://localhost:8080');
var playername = null;
var playerstate = "waiting";
var whosturn = "";

socket.on('connect', function(data) {
  socket.emit('roomenter', room);
  while (playername == null) {
    playername = prompt("Enter your name", "");
  }
  socket.emit('updatename', playername);
  alert("hit ok when you're ready to begin");
  socket.emit('ready');
  
  //makemove sends an attempt to steal
  function usermove(action,attempt) {
    if (action == "flip") {
      socket.emit('makemove', {
        playername: playername,
        action: "flip"
      });
    } else {
      socket.emit('makemove', {
        playername: playername,
        action: "attempt",
        word: attempt
      });
    }
  }
  
  //server updates the board
  socket.on('updateboard', function(data) {
    tilesonboard = data["tilesonboard"];
    players = data["players"];
    whosturn = data["whosturn"];
    
    $("#whosturn").text(whosturn);
    $("#boardletters").text("");
    $("#otherplayers").text("");
    var i;
    for (i = 0; i < tilesonboard.length; ++i) {
      $("#boardletters").append(tilesonboard[i] + ' ');
    }
  
    for (name in players) {
      playerHTML = "<h2>"+name+"</h2>";
      playerHTML += "<div>"+players[name].join(" ")+"</div>";
      $("#boardletters").append(playerHTML);
    }
  });

  socket.on('newletter', function(letter) {
    $('#boardletters').append(letter + ' ');
  });

  socket.on('whosturn', function(player) {
    whosturn = player;
    $("#whosturn").text(whosturn);
  });

  socket.on('countdown', function(data) {
    var header;
    switch (data.to) {
      case 'start':
        header = 'Game starts in:';
        break;
      case 'endturn':
        header = whosturn + "'s turn";
        break;
      case 'end':
        header = 'Game ends in:';
        break;
    }
    $('#countdownHeader').text(header);
    $('#countdown').text(data.time_left);
  });
  
  //server sends a message
  socket.on('updatemessage', function(data) {
    message = data['message'];
    $("#messagebox").append(message);
  });
  
  //server sends a playermove
  socket.on('playermove', function(data) {
    player = data['player'];
    word = data['word'];
    $("#messagebox").append(player + " stole " + word + "!");
  });
  
  //listener for attempting a steal
  $("#submitbtn").click(function(){
    attemptedword = $("#userinput").val();
    usermove("attempt", attemptedword);
  });
  
  //listener for flipping a tile
  $('body').keyup(function(e) {
    if (e.keyCode == 32) {
      if (whosturn == playername) {
        usermove("flip");
      }
    }
  });
});

