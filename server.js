var PORT = process.env.POST || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var shortid = require('shortid');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

io.on('connection',function (socket){
    console.log('user connected via socket.io!');
    
    socket.on('disconnect',function(){
       var userData = clientInfo[socket.id];
       
       if(typeof userData !== 'undefinde'){
            socket.leave(userData.room);
            io.to(userData.room).emit('message',{
               name: 'System',
               text: userData.name + 'has left!',
               timestamp: moment().valueOf() 
            });
            delete clientInfo[socket.id];
       } 
    });
    
    socket.on('joinRoom',function(req){
        req.score = 0;
        if(req.room === 'create'){
            req.room = shortid.generate();
        }
        clientInfo[socket.id] = req;
        socket.join(req.room);
        var players = {};
        var i = 0;
        for (var key in clientInfo) {
            if (!clientInfo.hasOwnProperty(key)) continue;
            var obj = clientInfo[key];
            var player = {};
            player.name = obj['name'];
            player.score = obj['score'];
            players[i] = player; 
            i++;          
        }
        io.to(req.room).emit('joinRoom',{
           room: req.room,
           players: players
        }); 
    });
    
    socket.on('start',function() {
        socket.broadcast.to(clientInfo[socket.id].room).emit('start');
            
    });
    
    socket.on('clickControl',function(req){
        var control = req; 
        socket.broadcast.to(clientInfo[socket.id].room).emit('clickControl',control);    
    });
    
    socket.on('message',function(message){
       console.log('Message recieved: '+message.text);
       message.timestamp = moment().valueOf();
       socket.broadcast.to(clientInfo[socket.id].room).emit('message',message); 
    });
    
    socket.emit('message',{
        name: 'System',
        text: "Welcome to the chat application!",
        timestamp: moment().valueOf()
    })
});

http.listen(PORT,function(){
   console.log('Server Started'); 
});