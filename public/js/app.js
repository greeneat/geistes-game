var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('access-code') || 'create';
var socket = io();

socket.on('connect',function(){
  console.log('Connected socket.io on server');
  socket.emit('joinRoom',{
    name: name,
    room: room
  });
});

socket.on('joinRoom',function(message){
  var room = message.room;
  var players = message.players;
  $('#access-code').html(room);
  var playerCount = 0;
  for (var key in players) {
      if (!players.hasOwnProperty(key)) continue;
        var obj = players[key];
        var playersList;
        playersList += '<tr><td>'+obj['name']+'</td><td>'+obj['score']+'</td></tr>';
        playerCount++; 
      }
     $('#player-list').html(playersList);
     if(playerCount == 1){
        $('#game-panel').show();  
     }else{
       if($('#game-panel').css("display") == 'none'){
        $('#waiting-panel').show();
       }
     }
});

socket.on('start',function(){
  $('#waiting-panel').hide();
  $('#game-play').show();
});

socket.on('clickControl',function(control){
  $('#control'+control.control).prop('disabled', true);
})

socket.on('message',function(message){
  var momentTimestamp = moment.utc(message.timestamp);
  var $messages = $('#message-box');
  var $message = $('<li class="list-group-item"></li>');
  console.log("new message");
  console.log(message.text);
  
  $message.append('<div class="recived"><p><strong>' +message.name+ ' ' +momentTimestamp.local().format('h:mm a')+'</strong></p>')
  $message.append('<p>'+message.text+'</p></div>');
  $messages.append($message);
});

var $form = $('#chat-form');
$form.on('submit',function(event){
  event.preventDefault();
  if($form.find('input[name=message]').val() !== ""){
    var momentTimestamp = moment.utc();
    var $message = $form.find('input[name=message]'); 
    
    socket.emit('message',{
      name:name,
      text:$message.val()
    })
    
    $('#message-box').append('<li class="list-group-item"><div class="send"><p><strong>You ' +momentTimestamp.local().format('h:mm a')+'</strong></p><p>'+$message.val()+'<p><div></li>');
    $message.val('');
  }
});

function clickControl(control){
  $('#control'+control).prop('disabled', true);
  socket.emit('clickControl',{
    control: control
  })
}

$('#btn-start-game').click(function(){
  $('#game-panel').hide();
  $('#game-play').show(); 
  socket.emit('start'); 
});