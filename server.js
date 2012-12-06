var router = require('./router');
var requestHandlers = require("./requestHandlers");

var http = require('http').createServer(onRequest);
var url = require('url');
var io = require('socket.io').listen(http);

var fs = require("fs");
var static = require('node-static');
var file = new(static.Server)();

var port = process.env.PORT || 5000;

http.listen(port);

	function onRequest(request,response) {
	
		console.log('node.js server started and is listening at 8888 port ...');
		
		file.serve(req, res, function(err, result) {
		  if (err) {
			console.error('Error serving %s - %s', req.url, err.message);
			if (err.status === 404 || err.status === 500) {
			  file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
			} else {
			  res.writeHead(err.status, err.headers);
			  res.end();
			}
		  } else {
			console.log('%s - %s', req.url, res.message);
		  }
		});

		var handle = {}
		handle["/"] = requestHandlers.start;
		handle["/start"] = requestHandlers.start;
		handle["/upload"] = requestHandlers.upload;
		handle["/show"] = requestHandlers.show;
		handle["/transfer"] = requestHandlers.transfer;

		var pathname = url.parse(request.url).pathname;
		console.log('pathname is '+pathname);
		
		/*if(pathname =='/books.jpg'){

			fs.readFile('./books.jpg', "binary",function (err, data) {

				if (err) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, {'Content-Type': 'image/jpeg'});
					response.write(data,"binary");
					response.end();
				}
			})
		}
		else{*/
		
			router.route(handle,pathname,response,request,io); //send request directly to router.js
		//}
	}
	
	function onConnected(socket) {
		
		socket.on('joinRoom', function (data) {
			console.log('Data Received: ', data);
			var userRoom,userNickname;
			for(var key in data){ 
				if(key =="room"){
					userRoom = data[key];
					socket.join(data[key]);
				}
				else {
					userNickname = data[key];
					socket.set('nickname',data[key]);
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
		
		socket.on('publicMessage',function (data) {
			console.log('Message Received: ', data);
			var userRoom,userMessage;
			socket.get('nickname', function (err, name) {
				for(var key in data){ 
					if(key =="room"){
						userRoom = data[key];
					}
					else {
						userMessage ='['+name+']:'+data[key];
					}
				}
				console.log('Message broadcast to', userRoom);
				console.log('Message is', userMessage);
				io.sockets.in(userRoom).emit('publicMessage',userMessage);
				//socket.broadcast.to(userRoom).emit('publicMessage',userMessage);
			})
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
	
