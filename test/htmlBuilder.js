var assert = require('assert');
var chai = require('chai');
var rewire = require('rewire');
var fs = require('fs');

var app = require("../routes/htmlBuilder.js");
var p_app = rewire("../routes/htmlBuilder.js");
var def = require("./testFiles/definitionFull.json");

var templates;
describe('htmlBuilder',function(){

	describe('build', function(){
		it('should send error with empty string', function(done){
			chai.expect(function(){
				app.build("");
			}).to.throw();
			done();
		});
		it('should not throw error', function(done){
			chai.expect(function(){
				app.build(def);
			}).to.not.throw();
			done();
		});
		it ('should change 2 files if valid json passed', function(done){
			chai.assert.isOk(function(){
				fs.watchFile('../views/partials/nav_list.hbs', function(event, filename){
					if(event){
						return true;
					}
					else{
						return false;
					}
				});
			});
			done();
		});
		it('should pass',function(done){
			var par = {"objects":"none",
					"parameters":[
					 {"type":"string","id":"test1"},
			         {"type":"integer", "id":"test2"}
					 ]
					};
			chai.assert.isArray(par.parameters);
			app.build(par);
			done();
		});
	});
	describe('choosePartial', function(){
		it('should fail if not listed',function(done){
			chai.expect(function(){
				app.testChoose("");
			}).to.throw("param not evaluated");
			done();
		});
		var tests = [
		{args: {"type":"string"}, expected: "text_partial"},
		{args: {"description": "hello devops managed parameter"}, expected: "managed_partial"},
		{args: {"allowedValues":["true","false"], "default":"true"}, expected:"bool_partial"},
		{args: {"allowedValues":["yes","no"]}, expected:"choice_partial"}
			           ]
		tests.forEach(function(test){
			it('evals: \"' + test.expected +"\"", function(done){
				var res = app.testChoose(test.args);
				assert.equal(res, test.expected);
				done();
			});
		});
	});
	
	describe('addToList', function(){
		it('should fail if 0 or 1 arg', function(done){
			chai.expect(function(){
				app.testAddToList("hello");
			}).to.throw();	
			chai.expect(function(){
				app.testAddToList();
			}).to.throw();
			chai.expect(function(){
				app.testAddToList("nlist");
			}).to.throw();
			done();
		});
		it('should fail if invalid file name',function(done){
			chai.expect(function(){
				app.testAddToList("hello","hi");
			}).to.throw();
			done();
		});
		it('should pass if valid', function(done){
			app.testAddToList(p_app.__get__("nlist"),"hello");
			done();
		});
	});
});