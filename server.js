//var http = require('http').createServer(onRequest);
var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	url = require('url'),
	io = require('socket.io').listen(server),
	fs = require("fs"),
	requestHandlers = require("./requestHandlers");

var port = process.env.PORT || 5000;

//server.listen('8888');
server.listen(port);

app.configure(function(){
    //app.set("view options", { layout: false, pretty: true });
    app.use(express.favicon());
    app.use(express.static(__dirname + '/public'));
	app.use('/static', express.static(__dirname + '/public'));
    }
);

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var onlineClients = {};

	app.get('/', function(req,res) {
		//console.log('node.js server started...');
		requestHandlers.start(res,req,io); //send request directly to router.js
	})
	
	function onConnected(socket) {
		
		socket.on('getRooms', function() {
			 var existingRooms = Object.keys(io.sockets.manager.rooms);
			 //console.log('existing Rooms are', existingRooms);
			 socket.emit('allRooms', existingRooms);
		})
		socket.on('joinRoom', function (data) {
			//console.log('Data Received: ', data);
			var userRoom,userNickname;
			for(var key in data){ 
				if(key =="room"){
					userRoom = data[key];
					socket.join(userRoom);
				}
				else {
					userNickname = data[key];
					socket.set('nickname',userNickname);
					onlineClients[userNickname] = socket.id;
				}
			}
			var nicknames="";
			io.sockets.clients(userRoom).forEach(function (socket) {
				socket.get('nickname', function(err, nickname) {
					if(nicknames==null || nicknames=="") 
						nicknames= nickname+',';
					else 
						nicknames += nickname+',';
				})
			});

			io.sockets.in(userRoom).emit('allUsers', nicknames);
			io.sockets.in(userRoom).emit('joinRoom',userNickname);
			
			var existingRooms = Object.keys(io.sockets.manager.rooms);
			io.sockets.emit('allRooms', existingRooms);
			
	    });
		
		socket.on('unjoinRoom', function (data) {
			//console.log('in unjoin');
			//console.log('Data Received: ', data);
			var userRoom,userNickname;
			for(var key in data){ 
				if(key =="room"){
					userRoom = data[key];
					socket.leave(userRoom);
				}
				else {
					userNickname = data[key];
				}
			}
			var nicknames="";
			io.sockets.clients(userRoom).forEach(function (socket) {
				socket.get('nickname', function(err, nickname) {
					if(nicknames==null || nicknames=="") 
						nicknames= nickname+',';
					else 
						nicknames += nickname+',';
				})
			});
			
			//console.log('nicknames are '+nicknames);
			//console.log('in unjoin 1');
			
			io.sockets.in(userRoom).emit('allUsers', nicknames);
			io.sockets.in(userRoom).emit('unjoinRoom',userNickname);
			//console.log('in unjoin 2');
			var existingRooms = Object.keys(io.sockets.manager.rooms);
			io.sockets.emit('allRooms', existingRooms);
			
	    });
		
		socket.on('publicMessage',function (data) {
			//console.log('Message Received: ', data);
			var userRoom,userMessage;
			socket.get('nickname', function (err, name) {
				for(var key in data){ 
					if(key =="room"){
						userRoom = data[key];
					}
					else {
						userMessage ='<b>'+name+'</b>: '+data[key];
					}
				}
				//console.log('Message broadcast to', userRoom);
				//console.log('Message is', userMessage);
				io.sockets.in(userRoom).emit('publicMessage',userMessage);
				//socket.broadcast.to(userRoom).emit('publicMessage',userMessage);
			})
		});
		
		socket.on('privateMessage',function (to, from, msg) {
			//console.log('Message Received: ', msg, 'for ', to, 'from ', from);
			var id = onlineClients[to];
			io.sockets.socket(id).emit('privateMessage',from, msg);
		});
		
		/*socket.on('message', function (msg) {
			socket.get('nickname', function (err, name) {
				var userRoom,userMessage;
				
				//socket.broadcast.emit('message', msg);
				for(var key in msg){ 
					if(key =="room"){
						userRoom = msg[key];
					}
					else {
						userMessage = name+':'+msg[key];
					}
				}
				console.log('Message broadcast to', userRoom);
				console.log('Message is', userMessage);
				socket.broadcast.to(userRoom).emit(userMessage);
			});
			
			socket.emit('message', msg);
			
	    });*/
		
		socket.on('disconnect', function () {
			console.log('in disconnect ');
			var userNickname;
			var userRooms = io.sockets.manager.roomClients[socket.id];
			for(var key in onlineClients){
				if(onlineClients[key] == socket.id){
					userNickname = key;
					break;
				}	
			}
			
			for(var userRoom in userRooms){
				userRoom = userRoom.replace('/','');
				socket.leave(userRoom);
				if(userRoom != null && userRoom != ""){
					var nicknames="";
					io.sockets.clients(userRoom).forEach(function (socket) {
						socket.get('nickname', function(err, nickname) {
							if(nicknames==null || nicknames=="") 
								nicknames= nickname+',';
							else 
								nicknames += nickname+',';
						})
					});
					
					//console.log('userRoom is '+userRoom);
					io.sockets.in(userRoom).emit('allUsers', nicknames);
					io.sockets.in(userRoom).emit('unjoinRoom',userNickname);
			    }
			}
			
			var existingRooms = Object.keys(io.sockets.manager.rooms);
			io.sockets.emit('allRooms', existingRooms);
			
		});
		
		socket.on('binaryMsg', function (to, from, bMsg) {
			var id = onlineClients[to];
			io.sockets.socket(id).emit('binaryMessage',from, bMsg);
		})
		
		
		//webrtc functions
		socket.on('message', function (message) {
			//console.log(message);
			socket.broadcast.emit('message', message); // should be room only
		});
	
		socket.on('create or join', function (room) {
			var numClients = io.sockets.clients(room).length;

			//console.log('Room ' + room + ' has ' + numClients + ' client(s)');
			//console.log('Request to create or join room ' + room);

			if (numClients == 0){
				socket.join(room);
				socket.emit('created', room);
			} else if (numClients == 1) {
				io.sockets.in(room).emit('join', room);
				socket.join(room);
				socket.emit('joined', room);
			} else { // max two clients
				socket.emit('full', room);
			}
			socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
			socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

		});
		
		socket.on('camReq', function (to, from) {
			var id = onlineClients[to];
			io.sockets.socket(id).emit('camRequest',from);
		})
		
		socket.on('camReqRes', function (to, from, msg) {
			var id = onlineClients[to];
			io.sockets.socket(id).emit('camRequestResult',from, msg);
		})
		
		
	}
	
	//var server = http.createServer(onRequest).listen('8888');
	io.sockets.on('connection', onConnected);
	
