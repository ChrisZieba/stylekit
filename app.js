
/*
	Create output using Apache FOP

	Takes in a stylesheet written in ejs, and outputs, an RTf
	or a PDF, based on the user supplied commands.

	Usage:
	---------------------------------------------------------------------------------------
	node app.js <answers filename> <input type> <stylesheet> <output type> <output filename>

*/

var fs = require('fs');
var ejs = require('ejs');
var spawn = require('child_process').spawn;
var config = require('./config');
var func = require('./lib/func');

var stylekit = (function () {
	// attach some helper functions to each var collected
	var buildOutputObject = function (answers) {
		for (var name in answers.master) {
		    answers.master[name].getLabel = function (id) {
				if (typeof id === 'undefined') {
					return this.label;
				} 

				if (Array.isArray(this.values[this.name])) {
					return this.values.label[id];
				} else {
					return this.values.label[id];
				}
		    };

		    // a helper function to get the answer to a question
		    answers.master[name].getAnswer = function () {
		    	// if no argument is give, return the value, could be an array if its a loop
		    	return this.values[this.name];
		    };

		    // a helper function to see if the quesiton was from a loop
		    answers.master[name].isLoop = function () {
		    	// if no argument is give, return the value, could be an array if its a loop
		    	return this.loop;
		    };
		}

		return answers;
	};

	// attach each answers helper functions, JSON strigigy leaves them out
	var buildAnswerSet = function (m) {
		var answers = {};
		// go through each variable and attach a few other properties
		for (name in m.master) {
			if (m.master.hasOwnProperty(name)) {
				answers[name] = m.master[name].values[name];
			}
		}
		return answers;
	};

	return {
		// 
		build: function () {
			// check if the answers file exists
			fs.readFile(config.loc.answers + process.argv[2], 'utf8', function (err, answers) { 
				if (err) throw err;

				fs.readFile(config.loc.stylesheets + process.argv[4], 'utf8', function (err, data) {
					if (err) throw err;

					var stylesheet, i;
					// since this will be error prone (user given style sheet), wrap it in a try block
					var outcome = buildOutputObject(JSON.parse(answers));
					var master = outcome.master;

					// stylesheet will be an .fo string, or a fdf string for a fillable form, 
					// with all the data replaced, ready to be sent to the fop or fdf processor

					var locals = { 
						master:outcome.master,
						progress:null,
						count: null,
						answers: buildAnswerSet(JSON.parse(answers))
					};

					// Attach all the common functions for the stylesheet and interview
					for (var fnCommon in func.common) {
						locals[fnCommon] = func.common[fnCommon];
					}

					// Attach all the functions for the stylesheet
					for (var fnLocal in func.stylesheet) {
						locals[fnLocal] = func.stylesheet[fnLocal];
					}

					var stylesheet = ejs.render(data, { 
						locals: locals
					});

					var now = Date.now();

					// this is where we write the temp file..a generated .fo or .fdf file.. only do this if the style sheet was generteated
					// this might be a loop for something like the sched of parties, which depends on how many parties are added in the interview
					fs.writeFile(config.loc.tmp + now + '.fo', stylesheet, function (err) {
						var cmd;

						if (err) throw err;

						// check to see what the output is and use the corresponding doc processor
						if (process.argv[5] === 'pdf_form') {
							// this will use pdftk to create a pdf that is filled
							//cmd = spawn('pdftk', [base_location + deliverable.input.form.path, 'fill_form', base_location + tmp_directory + tmp, 'output', base_location + out_directory  + out]);
							//spawn('pdftk', ['-fo', __dirname + 'fill_form' + now + '.fo', '-' + process.argv[5], __dirname + '/generated/' + process.argv[6]]);
						} else {
							// this runs the fop build command with the location specific to eitehr prod or dev
							cmd = spawn(config.loc.fop, ['-fo', config.loc.tmp + now + '.fo', '-' + process.argv[5], config.loc.generated + process.argv[6]]);
						}

						cmd.stderr.on('data', function (data) {
							console.log('stderr: ' + data);
						});

						cmd.on('exit', function (code) {
							if (code !== 0) {
								// the stylesheet never finished
								console.log('The stylesheet could not be processed.');
							} else {
								console.log('Success. Exit Code 0');
							}
						});
					});	
				});
			});
		}
	};

})();

// handle the command line args
if (process.argv.length !== 7) {
	console.log('Example Usage: node app.js example.json fo template.ejs pdf final.pdf');
} else {
	// Main()
	stylekit.build();	
}