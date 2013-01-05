var socket = io.connect('http://localhost:8080');
var playername = null;
var playerstate = "waiting";
var whosturn = "";

socket.on('connect', function(data) {
  
  //updatestatus user waiting
  while (playername == null) {
    playername = prompt("Enter your name","");
  }
  socket.emit('updatestatus', {
    room: room,
    status: "waiting",
    playername: playername
  });
  alert("hit ok when you're ready to begin");
  
  //updatestatus user ready
  socket.emit('updatestatus', {
    room: room,
    status: "ready",
    playername: playername
  });
  
  //makemove sends an attempt to steal
  function playermove(action,attempt) {
    if (action == "flip") {
      socket.emit('makemove', {
        action: "flip"
      });
    } else {
      socket.emit('makemove', {
        action: "steal",
        attempt: attempt
      });
    }
  }
  
  //server updates the board
  socket.on('updateboard', function(data) {
    tilesonboard = data["tilesonboard"];
    players = data["players"];
    whosturn = data["whosturn"];
    
    $("#boardletters").text("");
    $("#otherplayers").text("");
    for (tile in tilesonboard) {
      $("#boardletters").append(tilesonboard[tile]);
    }
  
    for (player in players) {
      playerHTML = "<h2>"+player["name"]+"</h2>";
      playerHTML += "<div>"+player["words"]+"</div>";
      $("#boardletters").append(playerHTML);
    }
  });
  
  //listener for attempting a steal
  $("#submitbtn").click(function(){
    attemptedword = $("#userinput").val();
    playermove("steal", attemptedword);
  });
  
  //listener for flipping a tile
  $('body').keyup(function(e) {
    if (e.keyCode == 32) {
      if (whosturn == playername) {
        playermove("flip");
      }
    }
  });
});

