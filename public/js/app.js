var socket = io();

socket.on('connect',function(){
  console.log('Connected socket.io on server');  
});