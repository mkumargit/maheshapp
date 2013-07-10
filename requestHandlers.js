var querystring = require("querystring");

function start(res,req,io){
		console.log('username is ...'+req.query['nickname']);
		res.cookie('nickname',req.query['nickname']);
		res.sendfile(__dirname + '/public/static/test.html');
}

exports.start = start;