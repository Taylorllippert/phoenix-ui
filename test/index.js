var http_mocks = require('node-mocks-http'),
should = require('should');
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var assert = require('assert');

var app, htmlBuilder, jBuilder, jReader, fs, pipeline;

function buildResponse(){
	return http_mocks
		.createResponse({eventEmitter: require('events')
			.EventEmitter});
}
before(function(){
	//jReader = require('../routes/jReader.js');
	//jBuilder = require('../routes/jBuilder.js');
	pipeline = require('../routes/pipeline.js');
	htmlBuilder = require('../routes/htmlBuilder.js');
	fs = require('fs');
});

function setup (){
	var response = buildResponse();
	sandbox.stub(response, "redirect")
		.callsFake(function(location){
			return location;
		});
	sandbox.spy(response, "render");
	return response;
};

app = require('../routes/index.js');
describe('Index',function(){
	describe('Choose Template Type',function(){
		beforeEach(function(){
			sandbox.stub(fs, "existsSync").returns(true);
			sandbox.stub(fs, "unlinkSync").callsFake(function(){});
			sandbox.stub(pipeline, "getTemps").returns("ftp");
		});
		afterEach(function(){
			sandbox.restore();
		});
		var response = setup();
		var request = http_mocks.createRequest({
			method: "GET",
			url: '/'
		});
		it('Renders once with code 200', function(done){
			app.handle(request,response, function(){});
			response.on('end',function(){
				response.statusCode.should.equal(200);
				assert(fs.unlinkSync.calledOnce);
				assert(response.render.calledOnce);
			});
			done();
		});				
	});
	describe('Type redirect',function(){
		beforeEach(function(){
			sandbox.stub(fs, "existsSync").returns(true);
			sandbox.stub(fs, "unlinkSync").callsFake(function(){});
		});
		afterEach(function(){
			sandbox.restore();
		});
		var tests = [
		             {choice: "ftp", status: 200,call:1},
		             {choice: "nope", status: 404, call:2}];
		tests.forEach(function(test){
			var response = setup();
			var request = http_mocks.createRequest({
				method: "POST",
				url: "/type",
				body: {tempChoice: test.choice}
			});
			app.handle(request,response, function(){});
			it('sends status '+test.status, function(){
				response.on('end',function(){
					response.statusCode.should.equal(test.status);
					assert(response.redirect.calledOnce);
					assert(response.redirect.returned("/type/"+test.choice));
					assert.equal(fs.unlinkSync.callCount, test.call);
				});
			});
		});
	});
	describe('Input form',function(){
		beforeEach(function(){
			sandbox.stub(fs, "existsSync").returns(true);
			sandbox.stub(fs, "unlinkSync").callsFake(function(){});
		});
		afterEach(function(){
			sandbox.restore();
		});
		var tests = [
		             {choice: "ftp", status: 200},
		             {choice: "nope", status: 404}];
		before(function(){
			sandbox.stub(pipeline, "setTemp")
			.returns({"name":"name"});
			sandbox.stub(htmlBuilder, "build")
			.callsFake(function(){
			});
		});
		it('sends correct status codes', function(done){
			tests.forEach(function(test){
			var response = setup();
			var request = http_mocks.createRequest({
				method: "GET",
				url: "/type/"+test.choice,
			});
			response.on('end',function(){
				response.statusCode.should.equal(test.status);
				assert(fs.unlinkSync.calledOnce == true );
			});
			app.handle(request,response, function(){
			});
			});
			done();
		});	
	});
	describe('/done',function(){
		beforeEach(function(){
			sandbox.stub(fs, "existsSync").returns(true);
			sandbox.stub(fs, "unlinkSync").callsFake(function(){});
		});
		afterEach(function(){
			sandbox.restore();
		});
		before(function(){
			var str = {"name":"name"};
			sandbox.stub(pipeline, "build");
			pipeline.build.onCall(0).returns(str);
			pipeline.build.returns(JSON.stringify(str));
		});
		it('Completed sends status 200', function(done){
		var response = setup();
		var request = http_mocks.createRequest({
			method: "POST",
			url: "/done",
			body: {name: "name"}
		});
		response.on('end',function(){
			response.statusCode.should.equal(200);
			assert(response.render.calledOnce);
		});
		app.handle(request,response,function(){});
		done();
		});
	});
	describe('/download',function(){
		it('sends correct status codes', function(done){
			var response = setup();
			var request = http_mocks.createRequest({
				method: "GET",
				url: "/download"
			});
			response.on('end',function(){
				response.statusCode.should.equal(200);
			});
			app.handle(request,response,function(){});
			assert(response.render.calledOnce == false);
			done();
		});
	});
});
