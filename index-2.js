var fs = require('fs');
var express  = require('express');
var app = module.exports = express.createServer();  

app.use("/", express.static(__dirname + '/app/'));
	
var server = app.listen(5000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Webservice at %s", host, port)
})
