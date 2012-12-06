
var static = require('node-static');
var file = new(static.Server)();

function route(handle,pathname,response,request,io){

	  console.log("About to route a request for " + pathname);
	  if (typeof handle[pathname] === 'function') {
			handle[pathname](response,request,io);
	  } else {
			file.serve(request, response, function(err, result) {
			  if (err) {
				console.error('Error serving %s - %s', request.url, err.message);
				if (err.status === 404 || err.status === 500) {
					console.log("No request handler found for " + pathname);
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write("404 Pathname not found");
					response.end();	
				  //file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
				} else {
				  console.log('other error is returned'); 
				  response.writeHead(err.status, err.headers);
				  response.end();
				}
			  } 
			  else {
				console.log('%s - %s', request.url, response.message);
			  }
			});
	  }

}

exports.route = route;