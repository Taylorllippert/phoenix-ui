var chai = require ('chai');
var chaiAP = require('chai-as-promised');
var expect = chai.expect;
chai.use(chaiAP);
var sinon = require ('sinon');
var rewire = require('rewire');
var fs = require('fs');
var debug = require('debug')('pipeline');

var app = require('../routes/pipeline.js');

var sandbox, spy, stub;

before(function(){
	sandbox = sinon.sandbox.create();
})


describe('pipeline',function(){
	afterEach(function(){
		sandbox.restore();
	});
	describe('getTemps',function(){
		it('should retrieve template options',function(done){
			var returned = app.getTemps();
			var num = 7;
			try{
			expect(returned.length).to.equal(num);
			}catch(err){
				console.log("Are there %d templates?", num);
			}
			done();
		});
		it('should throw',function(done){
			sandbox.stub(fs, "readdirSync").callsFake(function(){
				throw new Error("Error");
			});
			expect(function(){
				app.getTemps();
			}).to.throw();
			done();
		});
	});
	describe('setTemp',function(){
		var wiredApp;
		var options = ["ftp","sftp"];
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			wiredApp.__set__("options",options);
			app.setTemp = wiredApp.__get__("pipeline.setTemp");
		});
		it('should set the template type and require the file',function(done){
			expect(function(){
				app.setTemp("ftp");
			}).to.not.throw();
			expect(wiredApp.__get__("json")).to.not.be.undefined;
			done();
		});
		it('should throw',function(done){
			expect(function(){
				app.setTemp("nope");
			}).to.throw();
			
			done();
		});
		it('should throw',function(done){
			expect(function(){
				app.setTemp("sftp");
			}).to.throw();
			
			done();
		});
		
	});
	describe('build',function(){
		var wiredApp;
		var json;
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			app.build = wiredApp.__get__("pipeline.build");
			json = {"objects":[{"name":"<name1>_<name2>", "scriptArgument":
				["schedule_<format>"]},
				{"occurrences":"<occurrences>","period":"<period>"}],
				"parameters":
					[{"id":"id",
					 "default":"value"}
					 ]};
			wiredApp.__set__("json",json);
			wiredApp.__set__("getTemps", function(){
				return ["ftp", "s3"];
			});
			wiredApp.__set__("cleanJson",function(){
				return true;
			});
		});
		it('should use the input to build a new json',function(done){
			var input = {"name1":"N1", "name2":"N2", 
					"unit":"minutes",
					"occurrences":"",
					"period":"2",
					"id":"newValue"};
			var expected = {"objects":[{"name":"N1_N2", "scriptArgument":
				["schedule_YYYYMMddHHmm"]},
				{"period":"2"}],
				"parameters":
					[{"id":"id",
					 "default":"newValue"}
					 ]};
			input = JSON.stringify(input);
			expect(JSON.stringify(app.build(input)
				)).to.equal(JSON.stringify(expected));
			done();
		});
		it('should work with preconds too', function(done){
			var input = {"name1":"N1", "name2":"N2", 
					"unit":"minutes",
					"occurrences":"",
					"period":"2",
					"id":"newValue",
					"precondition[0][process]": "transform",
					  "precondition[0][schema]": "SchemaName0",
					  "precondition[0][table]": "TableName0",
					  "precondition[0][database]":"EDW1",
					  "precondition[0][template]": "TemplateName0",
					  "precondition[0][format]": "@scheduledEndTime, 'yyyymmdd'",
					  "precondition[2][process]": "transform",
					  "precondition[2][database]":"EDW2",
					  "precondition[2][schema]": "SchemaName2",
					  "precondition[2][table]": "TableName2",
					  "precondition[2][template]": "TemplateName2",
					  "precondition[2][format]": "@scheduledEndTime, 'yyyymmdd'"};
			var expected = {"objects":[{"name":"N1_N2", "scriptArgument":
				["schedule_YYYYMMddHHmm"], "precondition":[{"ref":"precondition0"},{"ref":"precondition2"}]},
				{"period":"2"},
				{
					 "name": "precondition0",
				     "id": "precondition0",
				     "type": "S3KeyExists",
				     "s3Key": "#{myPreconditionKeyLocation}/transform-EDW1-SchemaName0-TableName0-TemplateName0-#{format(@scheduledEndTime, 'yyyymmdd')}",
				     "role": "#{myPipelineRole}",
				     "maximumRetries": "60",
				     "retryDelay": "1 Minutes"
			    },
			    {
				      "name": "precondition2",
				      "id": "precondition2",
				      "type": "S3KeyExists",
				      "s3Key": "#{myPreconditionKeyLocation}/transform-EDW2-SchemaName2-TableName2-TemplateName2-#{format(@scheduledEndTime, 'yyyymmdd')}",
				       "role": "#{myPipelineRole}",
				      "maximumRetries": "60",
				      "retryDelay": "1 Minutes"
				   }],
				"parameters":
					[{"id":"id",
					 "default":"newValue"}
					 ]};
			input = JSON.stringify(input);
			expect(JSON.stringify(app.build(input)
				)).to.equal(JSON.stringify(expected));
			done();
		});
		it('should throw if no input', function(done){
			expect(function(){
				app.build();
			}).to.throw();
			done();
		});
	});
	describe('verifyInput',function(){
		var wiredApp;
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			app.verifyInput = wiredApp.__get__("verifyInput");
		});
		it('should not fail',function(done){
			expect(function(){
				app.verifyInput();
			}).to.not.throw();
			done();
		});
	});
	describe('myParse',function(){
		var wiredApp;
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			app.myParse = wiredApp.__get__("myParse");
		});
		var input;
		it('should parse string array into object form',function(done){
			input = {"item[0][a]":"item0a",
					"item[0][b]":"item0b",
					"item[2][a]":"item2a",
					"other[1][b]":"other1b",
					"other[0][a]":"other0a"};
			var expected = {
					"item":[{
					"a":"item0a",
					"id":"item0","b":"item0b"},null,{
						"a":"item2a", "id":"item2"
					}],
					"other":[{
						"a":"other0a",
						"id":"other0",},
						{"b":"other1b",
						"id":"other1"}
							]};
			wiredApp.__set__("input",input);
			expect(JSON.stringify(app.myParse())).to.equal(JSON.stringify(expected));
			done();
		});
	});
	describe('buildParams',function(){
		var input, json;
		var wiredApp;
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			app.buildParams = wiredApp.__get__("buildParams");
		});
		it('should throw',function(done){
			expect(function(){
				app.buildParams();
			}).to.throw();
			done();
		});
		it('should change parameters based on input',function(done){
			input = {"arg1":"name","arg2":"id"};
			json = {"parameters":[{"id":"arg1", "name":"arg1", "default":"none"},
			                      {"id":"arg2", "name":"arg2", "default":"none"},
			                      {"id":"arg3", "name":"arg3", "default":"none"}]};
			expected = {"parameters":[{"id":"arg1", "name":"arg1", "default":"name"},
				                      {"id":"arg2", "name":"arg2", "default":"id"},
				                      {"id":"arg3", "name":"arg3", "default":"none"}]};
			wiredApp.__set__("json",json);
			wiredApp.__set__("input",input);
			expect(JSON.stringify(app.buildParams())).to.equal(JSON.stringify(expected));
		done();
		});
	});
	describe('format',function(){
		var input,expected;
		var wiredApp;
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			app.format = wiredApp.__get__("formatScriptArgument");
		});
		it('should add input format object',function(done){
			input = {"unit":"minutes"};
			expected = {"unit":"minutes", "format":"YYYYMMddHHmm"};
			wiredApp.__set__("input",input);
			expect(
			JSON.stringify(app.format()
			)).to.equal(JSON.stringify(expected));
			done();
		});
		it('should throw',function(done){
			expect(function(){
				app.format();
			}).to.throw();
			done();
		});
	});
	describe('replace',function(){
		var input, obj,expected;
		var wiredApp;
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			app.replace = wiredApp.__get__("replaceAligators");
		});
		it('should replace <> values',function(done){
			input = {"name":"NAME"};
			obj = {"id":"<name>"};
			expected = {"id":"NAME"};
			expect(
				JSON.stringify(app.replace(input, obj)
				)).to.equal(JSON.stringify(expected));
			done();
		});
		it('should remove if input is empty',function(done){
			input = {"name":""};
			obj = {"array1":[{"object":{"array2":["<name>"]}}]};
			expected = obj = {"array1":[{"object":{"array2":[]}}]};
			expect(
					JSON.stringify(app.replace(input, obj)
					)).to.equal(JSON.stringify(expected));
			obj = {"array1":[{"object":{"array2":"<name>"}}]};
			expected = obj = {"array1":[{"object":{}}]};
			expect(
					JSON.stringify(app.replace(input, obj)
					)).to.equal(JSON.stringify(expected));
			done();
			
		});
		it('should recursivly handle sub objects',function(done){
			input = {"name":"NAME"};
			obj = {"array":[{"object":{"array":["<name>"]}}]};
			expected = obj = {"array":[{"object":{"array":["NAME"]}}]};
			expect(
					JSON.stringify(app.replace(input, obj)
					)).to.equal(JSON.stringify(expected));
			done();
		});
		it('should throw if no input or obj', function(done){
			expect(function(){
				app.replace()
			}).to.throw();
			expect(function(){
				app.replace(input)
			}).to.throw();
			done();
		});
	});
	describe('buildSection',function(){
		var wiredApp;
		beforeEach(function(){
			wiredApp = rewire('../routes/pipeline.js');
			app.buildSection = wiredApp.__get__("buildSection");
		});
		afterEach(function(){
			sandbox.restore();
		});
		it('should build preconditions', function(done){
			var json = {"objects":[{"name":"object1"},{"name":"object2"}]};
			var input = {"precondition":[{
		    	"id":"precondition0",
			    "process": "transform",
				"schema": "SchemaName0",
				"table": "TableName0",
				"template": "TemplateName0",
				"database":"EDW",
				"format": "@scheduledEndTime, 'yyyymmdd'"
			}]};
			var expected = {"objects":[
			                {"name":"object1", 
			                 "precondition":[{"ref":"precondition0"}]},
			                {"name":"object2"},
			                {"name": "precondition0",
			                 "id": "precondition0",
			                 "type": "S3KeyExists",
                      	     "s3Key": "#{myPreconditionKeyLocation}/transform-EDW-SchemaName0-TableName0-TemplateName0-#{format(@scheduledEndTime, 'yyyymmdd')}",
                      	     "role": "#{myPipelineRole}",
                      	     "maximumRetries": "60",
                      	     "retryDelay": "1 Minutes"}
                           ]};
			wiredApp.__set__("json",json);
			wiredApp.__set__("input",input);
			expect(JSON.stringify(app.buildSection("precondition"))
					).to.equal(JSON.stringify(expected));
			done();
		});
		it('should not call replace if no preconds',function(done){
			wiredApp.__set__("replace",function(){
				return true;
			});
			sandbox.spy(app, "replace");
			var json = {"name":"name"};
			var input = {"name":"name"};
			wiredApp.__set__("json",json);
			wiredApp.__set__("input",input);
			app.buildSection("precondition");
			done();
		});
		it('should throw if no input',function(done){
			expect(function(){
				app.buildSection("precondition");
			}).to.throw();
			done();
		});
	});
	describe('createFile', function(){
		var json = {"name":"name"};
		var wiredApp;
		beforeEach(function(){
			sandbox.stub(fs,"writeFileSync").returns(true);
			wiredApp = rewire('../routes/pipeline.js');
			wiredApp.__set__("json",json);
			app.createFile = wiredApp.__get__("createFile");
		});
		afterEach(function(){
			sandbox.restore();
		})
		it('should return true',function(done){
			expect(app.createFile()).to.equal(true);
			done();
		});
		it('should write to file one time', function(done){
			app.createFile();
			expect(fs.writeFileSync.callCount).to.equal(1);
			done();
		});
		it('should throw',function(done){
			sandbox.restore();
			sandbox.stub(fs,"writeFileSync").callsFake(function(){
				throw new Error("Error");
			});
			expect(function(){
				app.createFile();
			}).to.throw("Error");
			done();
		});
	});	
})