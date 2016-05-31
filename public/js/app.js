var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();

$('#room-title').html(room);

socket.on('connect',function(){
  console.log('Connected socket.io on server');  
  
  socket.emit('joinRoom',{
    name: name,
    room: room
  });
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