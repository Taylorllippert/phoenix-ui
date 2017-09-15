/*
DEPRECATED
-- Helpers do not need tests
-- scared to delete

var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var Hbs = require('handlebars');
var hbs = require('hbs');

var app = require('../handle.js');

var json = {"name":"NAME","id":"ID"};



describe('getJ',function(){
	afterEach(function(done){
		//cleanup
		done();
	});
	it('should send object to partial', function(){
		Hbs.registerPartial('test','{{name}}');
		this.first = JSON.stringify(json);
		this.fields = {first:JSON.stringify(json)};
		this.html = "{{#getJ first}}{{>test this}}{{/getJ}}";
		var template = Hbs.compile(this.html);
		var result = template(this.fields);
		expect(typeof result).to.equal("string");
		expect(result).to.equal("NAME");
	});
	it('should not throw if string is valid json obj',function(){
		Hbs.registerPartial('test','{{name}}');
		var str = {"name":"'append'", "id":"id"};
		this.first = JSON.stringify(str);
		this.fields = {first:JSON.stringify(str)};
		this.html = "{{#getJ first}}{{>test this}}{{/getJ}}";
		var template = Hbs.compile(this.html);
		var result = template(this.fields);
		expect(typeof result).to.equal("string");
		expect(result).to.contain("append");
	});
});

describe('concat',function(){
	it('should return one string',function(){
		this.first = "123";
		this.fields = {first:"123"};
		this.html = "{{#concat first last}}{{this}}{{/concat}}";
		var template = Hbs.compile(this.html);
		this.fields['last'] = "456";
		var result = template(this.fields);
		expect(result).to.equal("123456");
	});
});
describe('if_eq',function(){
	afterEach(function(done){
		//cleanup
		done();
	});

	beforeEach(function(){
		this.first = "123";
		this.fields = {first:"123"};
		this.html = "{{#if_eq first last}}true{{else}}false{{/if_eq}}";
	});
	it('should return false if the two are not equal',function(){
		var template = Hbs.compile(this.html);
		this.fields['last'] = "456";
		var result = template(this.fields);
		expect(result).to.equal("false");
	});
	it('should return true if the two are equal',function(){
		var template = Hbs.compile(this.html);
		this.fields['last'] = "123";
		var result = template(this.fields);
		expect(result).to.equal("true");
	});
});
describe('pprint',function(){
	afterEach(function(done){
		//cleanup
		done();
	});

	it('should return string',function(){
		this.first = json;
		this.fields = {first:json};
		expect(typeof this.first).to.equal("object");
		this.html = "{{#pprint first}}{{this}}{{/pprint}}";
		var template = Hbs.compile(this.html);
		var result = template(this.fields);
		expect(typeof result).to.equal("string");
		while(result.indexOf("&quot;") != (-1)){
			result = result.replace("&quot;","\"");
		}
		expect(result).to.equal(JSON.stringify(json,null,2));
	})
});
*/
