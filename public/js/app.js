var socket = io();

socket.on('connect',function(){
  console.log('Connected socket.io on server');  
});

socket.on('message',function(message){
  console.log("new message");
  console.log(message.text);
});