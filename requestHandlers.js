var querystring = require("querystring");

function start(res,req,io){
		//if(typeof(req.query['nickname']) != 'undefined' && req.query['nickname'] != null)
			res.cookie('nickname',req.query['nickname']);
		res.sendfile(__dirname + '/public/static/test.html');
}

exports.start = start;