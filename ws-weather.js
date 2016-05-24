'use strict';

var fs = require('fs');
var express  = require('express');
var app = module.exports = express.createServer();  

app.use("/meteo-data", express.static(__dirname + '/scrapper_data'));

app.get('/meteo-list', function (req, res) {
	req.fresh = true;
	fs.readFile( __dirname + '\\scrapper_data\\activites-nautiques.html', 'utf8', function (err, data) {
	   res.end(data);
	});
})

var server = app.listen(5000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Webservice at %s", host, port)
})
