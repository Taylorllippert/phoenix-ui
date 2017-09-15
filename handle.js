/*
Sets up view engine and templating 
*/
var hbs = require('express-handlebars');
var settings = require('./routes/settings.json');
var debug = require('debug')('handle');

var views = __dirname + "/views/";

hbs = hbs.create({
	extname: 'hbs',
	defaultLayout: 'layout', 
	layoutsDir: views + 'layouts/', 
	partialsDir: views + 'partials/',
	helpers:{
		concat: function(str1, str2){
			return str1 + str2;
		},
		pprint: function(context, options){
			return options.fn(JSON.stringify(context,null,2));
		},
		lookup: function(partial){
			return partial;
		},
		if_eq: function(arg1, arg2){
			return (arg1 == arg2);
		}
		
	}
})
module.exports = hbs;


