var querystring = require("querystring");

function start(res,req,io){
		if(req.query['nickname'] != null && req.query['nickname'] != 'undefined')
			res.cookie('nickname',req.query['nickname']);
		res.sendfile(__dirname + '/public/static/test.html');
}

exports.start = start;