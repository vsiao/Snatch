var socket = io.connect('http://localhost:8080');
var playername = null;
var playerstate = "waiting";
var whosturn = "";

socket.on('connect', function(data) {
  
  //updatestatus user waiting
  socket.emit('updatestatus', {room: "{room_id}",
    status: "waiting",
    playername: "unnamed"});
  while (playername == null){
    playername = prompt("Enter your name and hit OK when you are ready to begin","");
  }
  
  //updatestatus user ready
  socket.emit('updatestatus', {room: "{room_id}",
    status: "waiting",
    playername: playername});
  
  //server updates the board
  socket.on('updateboard', function(data) {
    tilesonboard = data["tilesonboard"];
    players = data["players"];
    whosturn = data["whosturn"];
    
    $("#boardletters").text("");
    $("#otherplayers").text("");
    for (tile in tilesonboard){
      $("#boardletters").append(tilesonboard[tile]);
    }
  
    for (player in players){
      playerHTML = "<h2>"+player["name"]+"</h2>";
      playerHTML += "<div>"+player["words"]+"</div>";
      $("#boardletters").append(playerHTML);
    }
  });
  
  
});