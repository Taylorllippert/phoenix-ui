/*
Deprecated because file is no longer in use

var assert = require('assert');
var chai = require('chai');
var fs = require('fs');
var sinon = require('sinon');
var rewire = require('rewire');

var app, sandbox, jReader, app2;

var INPUT = require("./testFiles/inputFull.json");
var SET = require("./testFiles/settingsFull.json");
var DEF = require("./testFiles/definitionFull.json");
var EXPECT = require("./testFiles/expectFull.json");
var PINPUT = require("./testFiles/inputParsed.json");
var INPUTNP = require("./testFiles/inputNoPre.json");
var EXPECTNP = require("./testFiles/expectNoPre.json");

before(function(){
	sandbox = sinon.sandbox.create();
	jReader = require('../routes/jReader.js');
});
app = require("../routes/jBuilder.js");
app2 = rewire('../routes/jBuilder.js');

describe('jBuilder',function(){
	afterEach(function(){
		sandbox.restore();
		});
	describe('build',function(){
		before(function(){
		sandbox.stub(jReader, "getJson").returns(DEF);
		});
		beforeEach(function(){
			sandbox.stub(fs, "writeFileSync").returns(true)
		});
		afterEach(function(){
			sandbox.restore();
		});
		it('should change json and save file', function(done){
			var expect = EXPECT;
			var res = app.build(INPUT);
			assert(fs.writeFileSync.calledOnce == true);
			assert(function(){checkAll(expect, res)});
			done();
		});	
		it('should throw if json is not found',function(done){
			var obj = {"name":"name"};
			chai.expect(function(){
				app.build(obj);
			}).to.throw();
			done();
		});
	});
	describe('format',function(){
		var input = {"schedule":"this"};
		var tests = [
		             {arg:"minutes",expect: "YYYYMMddHHmm"},
		             {arg:"hours" ,expect: "YYYYMMddHH"},
		             {arg:"days" ,expect: "YYYYMMdd"},
		             {arg:"weeks",expect: "YYYYMMdd"},
		             {arg:"months",expect: "YYYYMM"},
		             {arg:"seconds",expect: "YYYYMMddHHmm"}
		             ]
		tests.forEach(function(test){
			it('should format date '+test.arg,function(done){
				input.schedule_unit = test.arg;
				assert.equal(app.format(input).format, test.expect);
				done();
			});
			
		});
	});
	
	describe('verifyInput',function(){
		it('return true on valid input',function(done){
				assert(app.verifyInput(INPUT));
				assert(app.verifyInput("string"));
				done();
		});
		
	});
	describe('buildParams',function(){
		it('should change paramaters in json', function(done){
			var res = app.buildParams(INPUT, DEF);
			res = res.parameters;
			expect = EXPECT.parameters;
			assert(function(){checkAll(expect, res)});
			var obj = {"parameters":[{"name":"name"}]};
			assert(app.buildParams(obj,obj));
			var str = JSON.stringify(obj);
			assert(app.buildParams(str,str));
			done();
		});
	});
	describe('preconds',function(){	
		it('should change preconditions', function(done){
			var res = app.preconds(PINPUT,DEF, SET);
				for (i in EXPECT.objects[4]){
					assert.equal(res.objects[4][i],EXPECT.objects[4][i]);
				}
				for (i in EXPECT.objects[5]){
					assert.equal(res.objects[5][i],EXPECT.objects[5][i]);
				}
			done();
		});
		it('should return on no preconds',function(done){
			var res = app.preconds(INPUTNP,DEF, SET);
			chai.expect(res.objects[4]).to.be.undefined;
			done();
		});
		it('should work with strings or obj',function(done){
			var obj = {"name":"name"};
			assert(app.preconds(obj,obj,obj));
			var str = JSON.stringify(obj);
			assert(app.preconds(str,str,str));
			done();
		});
	});
	describe('replaceAligators',function(){	
		it('should replace value from between aligators in json with value from input',function(done){
			res = app.replaceAligators(INPUT, DEF.objects);
			var expect = EXPECT.objects;
			assert.equal(res[0].name,expect[0].name);
			assert.equal(res[3].occurrences,expect[3].occurrences);
			assert.equal(res[3].period, expect[3].period); 
			assert.equal(res[3].startDateTime,expect[3].startDateTime);
			done();
		});
		it('should still be okay with strings/objects',function(done){
			var obj = {"name":"name"};
			assert(app.replaceAligators(obj, obj));
			var str = JSON.stringify(obj);
			assert(app.replaceAligators(str,str));
			done();
		});
	});
	describe('saveDoc',function(){	
		beforeEach(function(){
			sandbox.stub(fs, "writeFileSync").callsFake(function(){
				return true;
			});
		});
		afterEach(function(){
			sandbox.restore();
		})
		it('should create new file',function(done){
			app.saveDoc("string");
			assert(fs.writeFileSync.calledOnce == true);
			done();
		});
		it('should work with object',function(done){
			var obj = {"name":"name"};
			app.saveDoc(obj);
			assert(fs.writeFileSync.calledOnce == true);
			done();
		});
	});
	describe('parse',function(){
		it('should return json obj',function(done){
			var res = app.myParse(INPUT);
			res = res.preconditions;
			expect = PINPUT.preconditions;
			assert(function(){
				checkAll(expect,res);
			});
			assert(app.myParse(JSON.stringify({"name":"name"})));
			done();
		});
	});
	it('All should throw on missing arguments', function(done){	
		var funcs = [app.build, app.testBuild, app.verifyInput, app.buildParams, app.replaceAligators, app.saveDoc, app.myParse, app.preconds];
		funcs.forEach(function(func){
			if(typeof func == "function"){
				chai.expect(function(){
					func();
				}).to.throw("Missing Argument");
			}
		});
		done();
	});
});


function checkAll (expected, actual){
	try{
		if(!expected || ! actual){
			throw new Error("Missing Argument");
		}
		for (all in expected){
			if(expected[all] != null && typeof expected[all]=="object"){
				assert(actual[all] != null && typeof actual[all] == "object");
				assert(function(){checkAll(expected[all], actual[all])});
			}else if(expected[all]!= null){
				assert(actual[all] != null);
				assert.equal(expected[all], actual[all]);
			}
		}
	}catch(err){
		throw err;
	}
	return true;
}

function swapObjStr(json){
	if(typeof json == "string"){
		return JSON.parse(json);
	}else if(typeof json == "object"){
		return JSON.stringify(json);
	}
	return false;
}

*/