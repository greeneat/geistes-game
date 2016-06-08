var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('access-code') || 'create';
var socket = io();
var playerClick = 0;

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
        playersList += '<tr><td>'+obj['name']+'</td><td><div id="score">'+obj['score']+'</div></td></tr>';
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

socket.on('start',function(obj){
  $('#list-control li button').show();
  $('#list-control li button').prop('disabled', true);
  $('#waiting-panel').hide();
  $('#game-play').show();
  timeCountdown(obj);
});

socket.on('clickControl',function(control){
  if($('#control'+control.control).css('display') !== 'none'){
    $('#control'+control.control).hide();
  }else{
    $('#control'+control.control).show();
  }
});

socket.on('finished',function(data){
  $('#game-play').hide();
  if(data.name === 'You'){
    $('#win-message').html(data.name+' Win!!');
    $('#game-panel').show();
  }else{
    $('#finished-message').html(data.name+' Win!!');
    $('#waiting-panel').show();
  }
  var players = data.players;
  var playersList;
  for (var key in players) {
      if (!players.hasOwnProperty(key)) continue;
      var obj = players[key];
      playersList += '<tr><td>'+obj['name']+'</td><td><div id="score">'+obj['score']+'</div></td></tr>';
  }
  $('#player-list').html(playersList);
});

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
  //$('#control'+control).prop('disabled', true);
  if(playerClick == 0){
    $('#list-control li button').hide();
    $('#control'+control).show();
    playerClick++;
  }else{
    $('#list-control li button').show();
    playerClick = 0;
  }
  socket.emit('clickControl',{
    control: control
  })
}

$('#btn-start-game').click(function(){
  $('#game-panel').hide();
  $('#game-play').show(); 
  socket.emit('start'); 
});


function timeCountdown(obj){
  $('#object-show').html('<div id="countdown"></div>');
  var color = ['grey','black','blue','green','red'];
  var img = "";
  $.each(obj, function(index, value) {
      value = shuffle(value);
      $.each(value, function(index, newvalue) {
      img += '<img src="img/obj/'+color[newvalue.color]+'/'+newvalue.obj+'.png"/>'
    }); 
  }); 
  
  var seconds_left = 6;
  var interval = setInterval(function() {
      document.getElementById('countdown').innerHTML = --seconds_left;
      
      if (seconds_left <= 0)
      {
        $('#list-control li button').prop('disabled', false);
        $('#object-show').html(img);
        //document.getElementById('countdown').innerHTML = "You are Ready!";
        clearInterval(interval);
      }
  }, 1000);
}

function shuffle(o){ 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};