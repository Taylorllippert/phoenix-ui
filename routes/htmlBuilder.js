/*
Public functions: build(json)
Takes json as input and customizes html rendering
Adds partial value to each parameter
Adds parameters to navlist -- (renders inside html)
*/


var express = require('express');
var fs = require("fs");
var path = require("path");
var settings = require('./settings.json');
var debug = require('debug')('htmlBuilder');

var nlist= __dirname + "/../"+settings.file_locations.partials+ "/nav_list.hbs";

function choosePartial(param)
{
	try{
		debug('choosePartial');
		partials = settings.partial_tags;
		for(var i = 0; i < partials.length; i ++){
			var flags = partials[i].flag;
			for(var j = 0; j< flags.length; j++){
				if(param[flags[j].name]){
					if(flags[j].value){
						if((param[flags[j].name]).toLowerCase().indexOf(flags[j].value) != (-1)){
							return partials[i].name;
							}
						}else{
							return partials[i].name;
						}
				}
			}
		}
		throw new Error("param not evaluated");
	}catch (err){
		debug('choose Partial: '+err.message);
		throw(err);	
	}
}

function addToList(list, item){
	try{
		debug('addToList');
		if(list == nlist){
			fs.appendFileSync(list, item, 'utf8', (err)=>{
				if(err) {throw err;}
			});
		}else
			throw new Error(list+ " is not valid");
	}catch(err){
		debug('add: '+err.message);
		throw(err);
	}
}

module.exports = {
	build:function(json){
		try{
			debug('build')
			if(! Array.isArray(json.parameters)){
				
				throw new Error("not array");
			}
			fs.writeFileSync(nlist,"");
			for(var i = 0; i <json.parameters.length; i++)
			{
				var partial = choosePartial(json.parameters[i]);
				json.parameters[i].partial = partial;
				if(partial !="managed_partial"){
					addToList(nlist, "<li onclick=\"changeActive(this)\" value=\""+json.parameters[i].id+"\"id=\""+json.parameters[i].id+"_nav\" >"+json.parameters[i].id+"</li>\n");
				}
			}
			debug('finished build');
		}catch(err){
			debug('build: '+err.message);
			throw(err);
		}
		return json;
	},
	//For testing only//
	testChoose: function(arg){
		return choosePartial(arg);
				
	},
	testAddToList: function(arg1,arg2){
		return addToList(arg1, arg2);
	}
}