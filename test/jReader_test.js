/*
Deprecated because file is no longer in use


var assert = require('assert');
var chai = require('chai');
var rewire = require('rewire');
var sinon = require('sinon');

var sandbox = sinon.sandbox.create();
var app = require("../routes/jReader.js");
var p_app = rewire("../routes/jReader.js");

describe('jReader',function(){
	afterEach(function(){
		sandbox.restore();
	})
	describe('getTemps', function(){
		it('should return 7 available templates', function(done){
			templates = app.getTemps();
			assert.equal(templates.length,7);
			done();
		});
		it('should catch errors',function(done){
			sandbox.stub(require('fs'),'readdirSync').throws();
			chai.expect(function(){
				app.getTemps()
			}).to.throw();
			done();
		});
	});
	describe('setTemp', function(){
		it('save and return object when valid',function(done){
			chai.assert.isObject(app.setTemp("ftp"));
			done();
		});
		var tests = ["nope",""," "];
		it('error when given incorrect type, no args, or empty string', function(done){
			tests.forEach(function(test){
				chai.expect(function(){
					app.setTemp(test)
				}).to.throw();
			});
			done();
		});
	});
	describe('getJson', function(){
		it('returns same object as set returns',function(done){
			for(var i =0; i < templates.length; i++){
				var set = app.setTemp(templates[i]);
				var get = app.getJson();
				chai.assert.isObject(get);
				assert.equal(get,set);
			}
			done();
		});
	});
	describe('isJsonString',function(){
		var tests = [
		             {args: "", expected: false},
		             {args: " ", expected: false},
		             {args: "{ }", expected: true},
		             {args: "Hello", expected:false},
		             {args: "{objects : paramaters}", expected: false}
		             ]
		it('evals strings correctly', function(done){
			tests.forEach(function(test){
				var res = app.isJsonString(test.args);
				assert.equal(res, test.expected);
			});
			done();
		});
	});
});
*/