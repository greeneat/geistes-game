var socket = io();

socket.on('connect',function(){
  console.log('Connected socket.io on server');  
});

socket.on('message',function(message){
  console.log("new message");
  console.log(message.text);
  
  $('#message-box').append('<p class="recived">'+message.text+'</p>');
});

var $form = $('#chat-form');
$form.on('submit',function(event){
  event.preventDefault();
  
  var $message = $form.find('input[name=message]'); 
  socket.emit('message',{
    text:$message.val()
  })
  
  $('#message-box').append('<p class="send">'+$message.val()+'</p>');
  $message.val('');
});