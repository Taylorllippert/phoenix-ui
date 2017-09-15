//To Do: Deprecate
//Should not be called by anything 
//Leaving in source control because i'm scared to delete

//Functions rewrote in pipeline.js

var express = require('express');
var fs = require("fs");
var path = require("path");
var settings = require("./settings.json");
var jReader = require("./jReader.js");
var debug = require('debug')('jBuilder');


module.exports = {
		build: function(input){
			return build(input);
		},
		//Testing only
		verifyInput: function(input){
			return verifyInput(input);
		},
		buildParams: function(input, json){
			return buildParams(input,json);
		},
		replaceAligators: function(input, json){
			return replaceAligators(input, json);
		},
		saveDoc: function(json){
			return saveDoc(json);
		},
		myParse: function(input){
			return myParse(input);
		},
		preconds: function(input, json, set){
			return preconds(input,json, set);
		},
		format: function(input){
			return format(input);
		}
}
function myParse(input){
	try{
		if(!input){
			throw new Error("Missing Argument");
		}
		if(typeof input != "object"){
			input = JSON.parse(input);
		}
		var ret = JSON.parse(JSON.stringify(input));
		for(i in input){
			var open = i.indexOf("[");
			if(open != (-1)){
				var name = i.substring(0,open);
				var subObj = [];
				for(j in input){
					if(j.indexOf(name) != (-1)){
						var close = j.indexOf("]");
						var index = parseInt(j.substring(open+1,close));
						var key  = j.substring(close+2, j.length-1);
						var value = input[j];
						if(typeof subObj[index] != "object"){
							subObj[index]={};
						}
						subObj[index][key]=value;
						delete ret[j];
						subObj[index]["id"]=name+index;
					}
				} 
				ret[name]=subObj;
			}
		}
	}catch(err){
		throw err;
	}
	return ret;
}
//new function for formatting
function format(input){
	switch(input.schedule_unit){
	case "minutes":
		input.format = "YYYYMMddHHmm";
		break;
	case "hours":
		input.format = "YYYYMMddHH";
		break;
	case "days":
		input.format = "YYYYMMdd";
		break;
	case "weeks":
		input.format = "YYYYMMdd";
		break;
	case "months":
		input.format = "YYYYMM";
		break;
	default:
		input.format = "YYYYMMddHHmm";
	}
	return input;
};


function build(input){
	var file;
	try{	
		if(!input){
			throw new Error("Missing Argument");
		}
		var json = jReader.getJson();
		if(!json){
			throw new Error("Missing Template");
		}
		verifyInput(input);
		json = preconds(myParse(input), json, settings);
		json = buildParams(input, json);
		var args = json.objects[0].scriptArgument;
		input = format(input);
		json.objects = replaceAligators(input, json.objects);
		saveDoc(json);
	}catch(err){
		throw err;
	}
	
	return json;
}

function verifyInput(input){
	try{
		if(input){
			return true;
		}else{
			throw new Error("Missing Argument");
		}
	}catch(err){
		throw err;
	}
}

function buildParams(input, json){
	try{
		
		if(!input || !json){
			throw new Error("Missing Argument");
		}
		if(typeof input != "object"){
			input = JSON.parse(input);
		}
		if(typeof json != "object"){
			json = JSON.parse(json);
		}
		var nJ = JSON.parse(JSON.stringify(json));
		for(var i = 0; i <nJ.parameters.length; i++){
			var id = nJ.parameters[i].id;
			var value = input[id];
			if(value){
				nJ.parameters[i].default = value;
				
			}else if(value == ""){
				nJ.parameters.splice(i,1);
			}
		}
	}catch(err){
		throw err;
	}
	return nJ;
}

function preconds(input,json ,set){
	try{
		if(!input || !json || !set){
			throw new Error("Missing Argument");
		}
		if(typeof input != "object"){
			input = JSON.parse(input);
		}
		if(typeof json != "object"){
			json = JSON.parse(json);
		}
		if(typeof set != "object"){
			set = JSON.parse(set);
		}
		var nJ = JSON.parse(JSON.stringify(json));
		if(!input.precondition){
			return nJ;
		}
		nJ.objects[0].precondition = [];
		for(i in input.precondition){
			if(input.precondition[i] && typeof input.precondition[i] == "object"){
				var data = JSON.parse(JSON.stringify(set.precondition));
				data = replaceAligators(input.precondition[i], data);
				if(data.name != 'undefined'){
					nJ.objects.push(data);
					var sub = {};
					sub.ref = data.name;
					nJ.objects[0].precondition.push(sub);
				}
			}
		}	
	}catch(err){
		throw err;
	}
	return nJ;
}

//var cntr = 0;
function replaceAligators(input, json){
	try{
		if(!input){
			throw new Error("Missing Argument");
		}
		var open;
		if(typeof input != "object"){
			input = JSON.parse(input);
		}
		if(typeof json != "object"){
			json = JSON.parse(json);
		}
		for (all in json){
			if(json[all] != null && typeof json[all]=="object"){
				json[all] = replaceAligators(input, json[all]);
			}else if(json[all]!= null){
				open = json[all].indexOf("<");
				if(open != (-1)){
					var close = json[all].indexOf(">");
					var str = json[all].slice((open+1),close);
					var value = input[str];
					str = "<"+str+">";
					json[all] = json[all].replace(str,value);
					if(json[all] ==""){
						delete json[all];
					}
					json= replaceAligators(input, json);
				}	
			}
		}
	}catch(err){
		throw err;
	}
	return json;
}


function saveDoc(json){
	try{
		if(!json){
			throw new Error("Missing Argument");
		}
		if(typeof json != "string"){
			json = JSON.stringify(json, null, 2);
		}
		var file = __dirname+"/../"+settings.file_locations.output;
		fs.writeFileSync(file, json);
	}catch(err){
		throw err;
	}
	return true;
}

