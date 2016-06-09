var PORT = process.env.POST || 3000;
//var express = require('express');
//var app = express();
var _ = require('underscore');
//var http = require('http').Server(app);
//var io = require('socket.io')(http);
var moment = require('moment');
var shortid = require('shortid');
var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

var clientInfo = {};
var correct;
var objectTrueColor = {
    1:{
        "obj":"ghost",
         "color":  0
    },
    2:{
        "obj":"rat",
         "color":  1
    },
    3:{
        "obj":"book",
         "color":  2
    },
    4:{
        "obj":"bottle",
         "color":  3
    },
    5:{
        "obj":"sofa",
         "color":  4
    }
}

var color = ['grey','black','blue','green','red'];

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
        var players = getPlayers(req.room);
        io.to(req.room).emit('joinRoom',{
           room: req.room,
           players: players
        }); 
    });
    
    socket.on('start',function() {
        correct = Math.floor(Math.random() * 5) + 1;
        var condition = Math.floor(Math.random() * 2) + 1;
        var obj = getGameCondition(condition,objectTrueColor[correct],correct); 
        console.log(condition);
        console.log(obj);
        io.to(clientInfo[socket.id].room).emit('start',{
            "obj":obj
        });
    });
    
    socket.on('clickControl',function(req){
        if(req.control === correct){
            console.log('corrected');
            clientInfo[socket.id].score++;
            var players = getPlayers();
            socket.broadcast.to(clientInfo[socket.id].room).emit('finished',{
                "name":clientInfo[socket.id].name,
                "players":players
            });
            
            socket.emit('finished',{
                "name":'You',
                "players":players
            });
        }else{
            var control = req; 
            socket.broadcast.to(clientInfo[socket.id].room).emit('clickControl',control);    
        }
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

server.listen(PORT,function(){
   console.log('Server Started'); 
});

function getPlayers(room){
    var i = 0;
    var players ={};
    for (var key in clientInfo) {
        if (!clientInfo.hasOwnProperty(key)) continue;
        var obj = clientInfo[key];
        var player = {};
        if(obj.room === room){
            player.name = obj['name'];
            player.score = obj['score'];
            players[i] = player; 
            i++;
        }          
    }
    return players;
}

function getGameCondition(gameCondition,gameCorrect,numCorrect){
    var otherObj = Object.assign({}, objectTrueColor);
    var otherColor = color.slice();
    delete otherObj[numCorrect];
    otherColor.splice(gameCorrect.color,1);
    if(gameCondition == 1){
        var obj = {};
        var result;
        var count = 0;
        for (var prop in otherObj)
            if (Math.random() < 1/++count)
            result = prop;
        var index = otherColor.indexOf(color[otherObj[result].color]);
        if (index >= 0) {
            otherColor.splice( index, 1 );
        }
        otherObj = otherObj[result]; 
        var ranAnotherColor =  color.indexOf(otherColor[Math.floor(Math.random() * otherColor.length)]);
        obj = [gameCorrect,{obj:otherObj.obj,color:ranAnotherColor}];     
    }else{
        var obj = [];
        var choice = {};
        var i=1;
        for(; i<=2;i++){
            var result;
            var count = 0;
            for (var prop in otherObj)
                if (Math.random() < 1/++count)
                    result = prop;
            var index = otherColor.indexOf(color[otherObj[result].color]);
            if (index >= 0) {
                otherColor.splice( index, 1 );
            }
            var ranAnotherobject = otherObj[result]; 
            var pickColor = Math.floor(Math.random() * otherColor.length);
            obj.push({"obj":otherObj[result].obj,"color":color.indexOf(otherColor[pickColor])});
            index = color.indexOf(otherColor[pickColor]);
            if (index >= 0) {
                delete otherObj[_.findKey(otherObj, {'color':index})];
                otherColor.splice(pickColor, 1 );
            }
            delete otherObj[result];
        }
    }
    return obj;
}