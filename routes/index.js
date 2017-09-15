/*
controls routing of http requests
*/

var express = require('express');
var router = express.Router();
var fs = require('fs');
var debug = require('debug')('myindex');


//var hbsHandler = require('./handle.js');
var settings = require('./settings.json');
//var jReader = require('./jReader.js');
var htmlBuilder = require('./htmlBuilder');
//var jBuilder = require('./jBuilder.js');

var pipeline = require('./pipeline.js');

//Choose Template page
router.get('/', function(req, res, next) {
	if(fs.existsSync(__dirname+"/../"+settings.file_locations.output)){
		fs.unlinkSync(__dirname+"/../"+settings.file_locations.output);
	}
	res.render('index', 
	{ title: 'Choose Pipeline Template', 
		message:"Please Choose from the available options",
		action: '/type', 
		method: 'post', 
		s_list: pipeline.getTemps()});
});

//Pulls response from choice and redirects
router.post('/type', function(req,res,next){
	if(fs.existsSync(__dirname+"/../"+settings.file_locations.output)){
		fs.unlinkSync(__dirname+"/../"+settings.file_locations.output);
	}
	res.redirect('/type/'+req.body.tempChoice);
});

//Receives choice and renders html form based on choice 
router.get('/type/:type', function(req, res, next){
	if(fs.existsSync(__dirname+"/../"+settings.file_locations.output)){
		fs.unlinkSync(__dirname+"/../"+settings.file_locations.output);
	}
	debug('redirected successfully');
	var type = req.params.type;
	var j = pipeline.setTemp(type);
	debug('setTemp success');
	json = htmlBuilder.build(j);
	debug('build success');
	try{
	res.render('form', {
		title: "Create New Pipeline",
		message: type.toUpperCase(),
		action: "/done",
		method: "post",
		j_data: j.parameters});
	}catch(err){
		debug('ERROR after render form');
	}
	debug('render success');
});

//Displays final pipeline
router.post('/done', function(req, res, next){
	debug('done');
	var input = req.body;
	var str = pipeline.build(JSON.stringify(input));
	debug(str);
	//str = JSON.stringify(str);
	res.render('done',{output: str});
});

//Downloads pipeline to users computer
router.get('/download',function(req,res){
	res.download(__dirname + "/../"+settings.file_locations.output,"definition.json");
});



module.exports = router;
