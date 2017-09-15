/*
Controls json file
Public functions:
	getTemps() -- retrieves list of available templates
	setTemp(temp) -- saves template in module for future use
	build(userInput) -- edits json from user input, output is pipeline
*/
var fs = require('fs');
var path = require('path');
var settings = require('./settings.json');
var debug = require('debug')('pipeline');

var pipeline = new Object();
var options, type;
var input;
var json;


pipeline.getTemps = function(){
	try{
		debug("GET TEMP");
		var filename = __dirname +"/../"+settings.file_locations.template;
		options = fs.readdirSync(filename).filter(file =>
		fs.lstatSync(path.join(filename,file)).isDirectory());
	}catch(err){
		debug('getTemps: %s', err.message);
		throw err;
	}
	return options;
};

pipeline.setTemp = function(temp){
	try{
		debug("SET TEMP");
		type = "";
		input = "";
		json = "";
		if(options.indexOf(temp) != (-1)){
			type = temp;
			cleanJson();
		}else{
			debug('setTemp template not in list');
			throw new Error("template not available");
		}
	}catch(err){
		debug('getTemps: %s', err.message);
		throw err;
	}
	return json;
};
//Controls functions to edit json file
pipeline.build = function(userInput){
	try{
		debug('build');
		cleanJson();
		//debug(typeof userInput);
		if(!userInput || userInput == ""){
			debug('No Input');
			throw new Error("No Input");
		}else{
			debug('input');
			input = JSON.parse(userInput);
			debug('input saved');
		}

		debug("INPUT: " + JSON.stringify(input));
		verifyInput();
		myParse();
		//debug("INPUT: "+ JSON.stringify(input, null, 2));
		//debug("json: " + JSON.stringify(json.objects,null,2));
		buildParams();
		formatScriptArgument();
		json.objects = replaceAligators(input, json.objects);
		//buildSection("schedule");
		//debug("json: " + JSON.stringify(json.objects,null,2))
		buildSection("precondition");
		
		createFile();
		json = JSON.parse(json);
		//debug('json:' + typeof json);
	}catch(err){
		debug('build: %s', err.message);
		throw err;
	}
	return json;
}	
//reads clean json file and checks if the file is in the list
function cleanJson(){
	try{	
		pipeline.getTemps();
		if(options.indexOf(type) != (-1)){
			var file = __dirname +"/../"+settings.file_locations.template;
			file += "/" +type +"/"+ settings.template_name;
			json = JSON.parse(fs.readFileSync(file, 'utf8'));
		}else{
			throw new Error("template not available");
		}
	}catch(err){
		debug("cleanJSON");
		throw err;
	}
}
//EMPTY -- for validation calls
function verifyInput(){
}
//Parses user input to read as objects
//changes "object[0][name]": "name" 
//into "object":[{"name":"name","id":"object0"}]
function myParse(){
	try{
		debug("MY PARSE");	
		//debug(typeof input);
		for (item in input){
			//debug('For each ITEM in input');
			var open = item.indexOf("[");
			//debug('...if it has [ in the key');
			if(open != (-1)){
				//debug('......save key');
				var objName = item.substring(0, open);
				debug("ObjectName: "+objName)
				var subObj = [];
				//debug('.........if key is found elsewhere in input');
				for(entry in input){
					//debug('............check if that key has [')
					if(entry.indexOf(objName) != (-1)){
						//debug('...............find ]');
						var close = entry.indexOf("]");
						//debug('...............save as index');
						var index = parseInt(entry.substring(open+1, close));
						//debug('...............save key');
						var key = entry.substring(close +2, entry.length-1);
						//debug('...............save value');
						var value = input[entry];
						//debug('...............if the subObj[index] is not an object');
						//debug('INDEX: '+index);
						if(index != 'NaN'){
							if(typeof subObj[index] != "object"){
							//	debug('..................make it an object')
								subObj[index]={};
							}
							//debug('...............add the key value pair');
							subObj[index][key] = value; 
							//debug('...............add the id/key pair');
							subObj[index]["id"] = objName + index;
							//debug('............add to input');
							input[objName] = subObj;
						}
						delete input[entry];
					}//end of if entry match
					
				}//end for entries in input
				
				
			}//end of if [
		}//end for items in input
	}catch(err){
		debug('myparse: %s',err.message);
		throw err;
	}
	return input;
}
//Edits parameter section
function buildParams(){
	try{
		debug("BUILD PARAMS");
		//debug(typeof input);
		//debug(typeof json);
		var temp = json.parameters;
		for(par in temp){
			var id = temp[par].id;
			var value = input[id];
			if(value){
				temp[par].default = value;
			/*Deletes section if user input is empty
			}else if(value == "" || value == " "){
				temp.splice(par,1);*/
			}
			//delete json.parameters[par].Partial;
			//debug("this one: " + json.paramaters[par]);
		}
	}catch(err){
		debug('buildParams: %s',err.message);
		throw err;
	}
	return json;
}

//should create format location in input
//if multiple schedules is enabled this will need to be reworked
function formatScriptArgument(){
	try{
		debug("FORMAT SCRIPT ARGUMENT");
		//debug(typeof input);
		//debug(typeof json);
		input.format = "";
		var format = "";
		 switch(input.unit){
			 case "minutes":
				 format = "mm";
				 debug('format:' + format);
			 case "hours":
				 format = "HH" + format;
				 debug('format:' + format);
			 case "days" || "weeks":
				 format = "dd" + format;
				 debug('format:' + format);
			 case "months":
				 format = "MM" + format;
				 debug('format:' + format);
			default:
				format = "YYYY" + format;
				debug('format:' + format);
		 };
		 input.format = format;
	}catch(err){
		debug('format: %s',err.message);
		throw err;
	}
	return input;
}

//starts with objects input
//returns objects 
//Recursively search for "< >" in json
//looks for matching input id and replaces "< >" with value
function replaceAligators(input, obj){
	try{
		//debug("REPLACE ALIGATORS");
		//debug(typeof input);
		//debug(typeof json);
		if(!input){
			//debug('no Input');
			throw new Error("No input");
		}
		if(!obj){
			//debug('no object');
			throw new Error("No Obj");
		}
		//debug('obj at function call: ' + obj);
		var open_location;
		for (all in obj){
			//debug('For each key: ' + all);
			if(obj[all] != null && typeof obj[all] == "object"){
				//debug('Recursing into key: '+all);
				obj[all] = replaceAligators(input, obj[all]);
			}else if(obj[all] != null){
				//debug('Key value is not null or obj');
				open_location = obj[all].indexOf("<");
				if(open_location != (-1)){
					//debug('Open Aligator found');
					var close_location = obj[all].indexOf(">");
					var str = obj[all].slice((open_location+1),close_location);
					var value = input[str];
					str = "<"+str+">";
					obj[all]= obj[all].replace(str,value);
					if(obj[all]==""){
						debug('Value is empty string');
						delete obj[all];
					}
					//debug('Calling Replace at same level');
					obj = replaceAligators(input, obj);
				}
				//debug('end if Open found');
			}//end if not null
		}//end for all in obj
	}catch(err){
		debug('replaceAligators: %s',err.message);
		throw err;
	}
	return obj;
}
//precondition section only
//gets format from settings.json  
//creates copy for each item in the array
//pushes ref = id into objects 0
//schedule option commented out
function buildSection(item){
	try{	
		debug("buildSection: "+item);
		debug(typeof input);
		debug(typeof json);
		if(input[item]){
			var template = settings[item];
			var Pre = input[item];
			json.objects[0][item] = [];
			/* To enable multiple schedules uncomment
			if(item == "schedule"){
				json.objects[1].schedule = [];
			}
			*/
			for (all in Pre){
				if(Pre[all] && typeof Pre[all] == "object"){
					var temp = JSON.parse(JSON.stringify(template));
					temp = replaceAligators(Pre[all], temp);
					if(temp.name != 'undefined'){
						json.objects.push(temp);
						var next = {};
						next.ref = temp.name;
						json.objects[0][item].push(next);
						/* To enable multiple schedules uncomment
						if(item == "schedule"){
							json.objects[1].schedule.push(next);
						}
						*/
					}//end of if defined
					else{
						debug("UNDEFINED"+temp);
					}
				}//end of if object
			}//end of all in input
		}//end of if precondition
		else{
			debug('no section: '+item);
		}
	}catch(err){
		debug('build %s: %s',item, err.message);
		throw err;
	}
	return json;
}
/* Depricated in favor of more generic build section*/
/*
function buildPreconds(){
	/*try{	
		debug("BUILD PRECONDS");
		//debug(typeof input);
		//debug(typeof json);
		if(input.precondition){
			var template = settings.precondition;
			var Pre = input.precondition;
			json.objects[0].precondition = [];
			for (all in Pre){
				if(Pre[all] && typeof Pre[all] == "object"){
					var temp = JSON.parse(JSON.stringify(template));
					temp = replaceAligators(Pre[all], temp);
					if(temp.name != 'undefined'){
						json.objects.push(temp);
						var next = {};
						next.ref = temp.name;
						json.objects[0].precondition.push(next);
					}//end of if defined
				}//end of if object
			}//end of all in input
		}//end of if precondition
		else{
			debug('no precondition');
		}
	}catch(err){
		debug('build preconds: %s',err.message);
		throw err;
	}
	return json;
	return buildSection("precondition");
}
*/

//Saves json to location specified by settings.json
//
//TODO: 
//Create dir
//zip dir for download
function createFile(){
	try{
		debug("CREATE FILE");
		//debug(typeof json);
		if(typeof json != "string"){
			json = JSON.stringify(json, null, 2);
		}
		var file = __dirname+"/../"+settings.file_locations.output;
		fs.writeFileSync(file, json);
	}catch(err){
		debug('createFile: %s',err.message);
		throw err;
	}
	//debug(json);
	return true;
};

module.exports = pipeline;
