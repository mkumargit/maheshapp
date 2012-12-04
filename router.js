
function route(handle,pathname,response,request,io){

	  console.log("About to route a request for " + pathname);
	  if (typeof handle[pathname] === 'function') {
			handle[pathname](response,request);
	  } else {
			console.log("No request handler found for " + pathname);
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write("404 Pathname not found");
			response.end();
	  }

}

exports.route = route;