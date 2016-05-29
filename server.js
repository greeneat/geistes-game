var PORT = process.env.POST || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static(__dirname + '/public'));

http.listen(PORT,function(){
   console.log('Server Started'); 
});