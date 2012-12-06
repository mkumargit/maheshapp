
var querystring = require("querystring");
var fs = require("fs");
var util = require("util");
var formidable = require("formidable");

function start(response,request,io){
		
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

function show(response,request,io){

		console.log('in request handler file and show method');
		
		var body = '<html>'+
		'<head>'+
		'<meta http-equiv="Content-Type" '+
		'content="text/html; charset=UTF-8" />'+
		'<link rel="stylesheet" href="http://code.jquery.com/ui/1.9.1/themes/base/jquery-ui.css" />'+
		'<script src="http://code.jquery.com/jquery-1.8.2.js"></script>'+
		'<script src="http://code.jquery.com/ui/1.9.1/jquery-ui.js"></script>'+
		'<script src="/socket.io/socket.io.js"></script>'+
		'<script>'+
		'$(function() {'+
		'var iosocket = io.connect("http://boiling-oasis-5706.herokuapp.com");iosocket.on("connect", function () {'+
		'iosocket.on("message", function(message) {'+
		'var progressVal = parseInt(message);'+
		'$(".caption").html(progressVal+"%");'+
		'$( "#progressbar" ).progressbar({value: progressVal});'+
		'});'+
		'})'+
		'})'+
		'</script>'+
		'</head>'+
		'<body>'+
		'<div id="progressbarWrapper" style="height:30px;width:300px" class="ui-widget-default">'+
		'<span class="caption"></span>'+
		'<div id="progressbar" style="height: 100%;"></div>'+
		'</div><br/><br/>'+
		'Please upload the file'+
		'<form action="/upload" enctype="multipart/form-data" '+
		'method="post">'+
		'<input type="file" name="upload" multiple="multiple">'+
		'<input type="submit" value="Upload file" />'+
		'</form>'+
		'</body>'+
		'</html>';
		
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write(body,"utf-8");
		response.end();
}

function upload(response,request,io){

	var progress=0;
	var form = new formidable.IncomingForm(),
    files = [],
    fields = [];

    form.uploadDir = ".";
	form.keepExtensions = true;

    form
      .on('field', function(field, value) {
        console.log(field, value);
        fields.push([field, value]);
      })
      .on('file', function(field, file) {
        console.log(field, file);
        files.push([field, file]);
      })
	  /* this is where the renaming happens */
	  .on ('fileBegin', function(name, file){
			//rename the incoming file to the file's name
			//var newFileName = file.name+'1';
			file.path = form.uploadDir + "/mahesh_" + file.name;
	   })
	    //Display the progress of upload
	   .on('progress', function(bytesReceived, bytesExpected) {
		  progress = (bytesReceived / bytesExpected * 100).toFixed(0);
		  io.sockets.send(progress);
	   })
	   
      .on('end', function() {
        console.log('-> upload done');
        response.writeHead(200, {'content-type': 'text/plain'});
        response.write('received fields:\n\n '+util.inspect(fields));
        response.write('\n\n');
        response.end('received files:\n\n '+util.inspect(files));
      });
    form.parse(request);
}

function transfer(response,request,io){

		fs.readFile('./test1.html',function (err, data) {
		
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

function recieve (response,request,io){
	
}

exports.start = start;
exports.show = show;
exports.upload = upload;
exports.transfer = transfer;
exports.recieve = recieve;