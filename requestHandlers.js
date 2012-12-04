
var querystring = require("querystring");
var fs = require("fs");
var util = require("util");

function start(response,request){
		
		/*var body = '<html>'+
		'<head>'+
		'<meta http-equiv="Content-Type" '+
		'content="text/html; charset=UTF-8" />'+
		'</head>'+
		'<body>'+
		'Please upload an image'+
		'<form action="/upload" enctype="multipart/form-data" '+
		'method="post">'+
		'<input type="file" name="upload" multiple="multiple">'+
		'<input type="submit" value="Upload file" />'+
		'</form>'+
		'</body>'+
		'</html>';
		
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(body,"utf-8");
		response.end();*/
		
		fs.readFile('./test.html',function (err, data) {
		
		if (err) {
            response.writeHead(500);
            response.end();
        }
		else {
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(data,"utf-8");
			response.end();
		}
		
		})


}

function show(response,request){

		console.log('in request handler file and show method');
		var body = '<html>uploaded</html>';
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(body,"utf-8");
		response.end();
}

exports.start = start;
exports.show = show;