var router = require('./router');
var requestHandlers = require("./requestHandlers");

var http = require('http').createServer(onRequest);
var url = require('url');
var io = require('socket.io').listen(http);

var fs = require("fs");

var port = process.env.PORT || 5000;

http.listen(port);
//http.listen('8888');

var onlineClients = {};

	function onRequest(request,response) {
	
		console.log('node.js server started and is listening at 8888 port ...');

		var handle = {}
		handle["/"] = requestHandlers.start;
		handle["/start"] = requestHandlers.start;
		handle["/upload"] = requestHandlers.upload;
		handle["/show"] = requestHandlers.show;
		handle["/transfer"] = requestHandlers.transfer;

		var pathname = url.parse(request.url).pathname;
		
		router.route(handle,pathname,response,request,io); //send request directly to router.js
	}
	
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
			
	    });
		
		socket.on('unjoinRoom', function (data) {
			console.log('in unjoin');
			console.log('Data Received: ', data);
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
			
			console.log('nicknames are '+nicknames);
			console.log('in unjoin 1');
			
			io.sockets.in(userRoom).emit('allUsers', nicknames);
			io.sockets.in(userRoom).emit('unjoinRoom',userNickname);
			console.log('in unjoin 2');
			
	    });
		
		socket.on('publicMessage',function (data) {
			console.log('Message Received: ', data);
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
		
		socket.on('message', function (msg) {
			/*socket.get('nickname', function (err, name) {
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
			});*/
			
			socket.emit('message', msg);
			
	    });
		
	}
	
	//var server = http.createServer(onRequest).listen('8888');
	io.sockets.on('connection', onConnected);
	
