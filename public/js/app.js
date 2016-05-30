var socket = io();

socket.on('connect',function(){
  console.log('Connected socket.io on server');  
});

socket.on('message',function(message){
  console.log("new message");
  console.log(message.text);
});

var $form = $('#chat-form');
$form.on('submit',function(event){
  event.preventDefault();
  
  var $message = $form.find('input[name=message]'); 
  socket.emit('message',{
    text:$message.val()
  })
  
  $message.val('');
});