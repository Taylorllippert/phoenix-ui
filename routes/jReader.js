//To Do: Deprecate
//Should not be called by anything 
//Leaving in source control because i'm scared to delete

//Functions rewrote in pipeline.js

var express = require('express');
var fs = require("fs");
var path = require("path");
var settings = require('./settings.json');
var debug = require('debug')('jReader');

var FILENAME = __dirname+"/../"+settings.file_locations.template;
var template;
var json;

function isJsonString(str){
	try{
		JSON.parse(str);
	}catch(err){
		return false;
	}
	return true;
}


function getTemps(){
	try{			
		var filename = FILENAME;
		avail_types =fs.readdirSync(filename).filter(file =>
		fs.lstatSync(path.join(filename,file)).isDirectory());
	}catch(err){
		throw(err);
	}
	return avail_types;
}


function setTemp(temp){
	try{
		var avail_types = getTemps();
			if(avail_types.indexOf(temp) != (-1)){
				template = temp;
				var file = FILENAME + "/" +template+"/"+ settings.template_name;
				json = require(file);
				return json;
			}else{
				throw new Error("template not available");
			}
	}catch(err){
		throw err;
	}	
}

module.exports = {
		isJsonString: function(str){
			return isJsonString(str);
		},
		getTemps: function (){
			return getTemps();
		},
		
		setTemp: function (temp){
			return setTemp(temp);
		},
		
		getJson: function (){
			return json;
		}
}