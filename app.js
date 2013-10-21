
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

				if (err) {
					console.log(err);
					throw err;
					
				} else {

					fs.readFile(config.loc.stylesheets + process.argv[4], 'utf8', function (err, data) {

						var stylesheet, i;

						if (err) {
							callback(err);
						} else {
							// since this will be error prone (user given style sheet), wrap it in a try block
							var outcome = buildOutputObject(JSON.parse(answers));
							var master = outcome.master;

							// stylesheet will be an .fo string, or a fdf string for a fillable form, 
							// with all the data replaced, ready to be sent to the fop or fdf processor
							stylesheet = ejs.render(data, { 
								locals: { 
									master:outcome.master,
									progress:null,
									count: null,
									answers: buildAnswerSet(JSON.parse(answers)),
									capitalize: function (str) {
										return str.charAt(0).toUpperCase() + str.slice(1);
									},

									round: function (val) {
										return Math.round(val);
									},
									//return the ordinal of a given index
									numberWord: function (index) {

										var od = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
										
										if (arguments.length === 1) {
											if (od[index]) {
												return od[index];
											}
										} 
										return false;
										
									},
									//return the ordinal of a given index
									ordinal: function (index, num) {

										var od = ['zeroeth','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth'],
											odn = ['0th','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th','13th','14th','15th','16th','17th','18th','19th','20th'];
										
										if (arguments.length === 2) {
											if (odn[index]) {
												return odn[index];
											}
										} else {
											if (od[index]) {
												return od[index];
											}
										}


										return false;
										
									},
									// this function takes the name of the checbox, and the id of the one we want to evaluate 
									// id can be a single value or an array
									// @param name the name of the field - STRING
									// @param id is the id of the checkbox [can be an array of id's]
									// to check for NOTA just pass in 'nota' as the id
									isChecked: function (name, id, index) {

										var i, checkbox;

										index = (typeof index !== 'undefined') ? parseInt(index, 10) : null;

										// first check if the name is defined
										if (master[name] !== null && typeof master[name] !== 'undefined' && master[name].type === 'checkbox') {

											checkbox = (index !== null && !isNaN(index)) ? master[name].values[name][index] : master[name].values[name];

											if (typeof checkbox === 'undefined' || checkbox === null || checkbox === "") {
												return false;
											}

											// checkboxk to see if id is an array
											if (Array.isArray(id)) {


												// if we dont find the id on any iteration the function returns false
													for (i = 0; i < id.length; i+=1) {
														if (JSON.parse(checkbox).indexOf(id[i]) === -1) {
															return false;
														} 
													}



												// if we get through the loop that means each id was OK 
												return true;
											} 

											// we need to parse the stringifed array and check if the supplied id is in it
											if (JSON.parse(checkbox).indexOf(id) >= 0) {
												return true;
											}
											
										} 
										return false;
									},
									//checks if a variable was naswered and has a value (not empty string)
									// index is an optional parameter used when in a loop to check if an aswer in a loop was answered
									// name can be an array of names to check, it is the variable not a string
									isAnswered: function (name, index) {

										var i;

										if (Array.isArray(name)) {
											for (i = 0; i < name.length; i+=1) {

												if (index !== null && typeof index !== 'undefined') {
													if (master[name[i]] !== null && typeof master[name[i]] !== 'undefined') {
														if (master[name].values[name[i]][index] !== null && typeof master[name[i]].values[name][index] !== 'undefined' && master[name[i]].values[name[i]][index] !== '') {
															return true;
														} 
													}
												} else {
													if (master[name[i]] !== null && typeof master[name[i]] !== 'undefined') {
														if (master[name[i]].values[name] !== '' && master[name[i]].values[name[i]].length !== 0) {
															return true;
														}
													}
												}
											}
										} else {

											if (index !== null && typeof index !== 'undefined') {
												if (master[name] !== null && typeof master[name] !== 'undefined') {
													if (master[name].values[name][index] !== null && typeof master[name].values[name][index] !== 'undefined' && master[name].values[name][index] !== '') {
														return true;
													} 
												}
											} else {
												if (master[name] !== null && typeof master[name] !== 'undefined') {
													if (master[name].values[name] !== '' && master[name].values[name].length !== 0) {
														return true;
													}
												}	
											}
										}
										return false;
									},
									get: function (name, index) {

											if (index !== null && typeof index !== 'undefined') {
												if (master[name] !== null && typeof master[name] !== 'undefined') {
													if (master[name].values[name][index] !== null && typeof master[name].values[name][index] !== 'undefined' && master[name].values[name][index] !== '') {
														return master[name].values[name][index].toString().trim();
													} 
												}
											} else {
												if (master[name] !== null && typeof master[name] !== 'undefined') {
													if (master[name].values[name] !== null && master[name].values[name] !== '' && master[name].values[name].length !== 0) {
														return master[name].values[name].toString().trim()
													}
												}	
											}
										
										return '';
									},
									// d is the date string and format is the format of the string given to us, and out is the format we want the string in
									dateFormat : function (date, in_format, out_format) {

										var moment = require('moment'),
											// the allowed formats is used to check against the date entered
											formats = ['DD/MM/YYYY','MM/DD/YYYY'];

										// if no format for the date is given as an argument, use a default
										in_format = formats.indexOf(in_format) >= 0 ? in_format : 'MM/DD/YYYY';

										// if no format is given for the output date, use a default
										out_format = typeof out_format !== 'undefined' ? out_format : 'MM/DD/YYYY';

										// if the in)format is days and the date is a number (ie. days)
										if (in_format === 'days') {
											return moment("01/01/1900", "MM/DD/YYYY").add('days', date).format(out_format);
										} else {
											// if no date is given as input, set it to today
											date = typeof date !== 'undefined' ? moment(date, in_format) : moment(new Date());
										}

										return date.format(out_format);


									},
									// the frist two args are mandatory, and if the last two are not given we set the date to today
									// m is the unit for the difference, ie. 'days'
									// to check if a date2 comes after date1 use ('12/24/1977', 'MM/DD/YYYY', 'days', '01/01/2012', 'MM/DD/YYYY')  > 0 // true
									// thios will be zeroif they are same date, negative if the first date 
									// if the second date paramter is after the first, than the result will be positive
									dateDifference : function (d1, f1, m, d2, f2) {

										var moment = require('moment'),
											allowed_in_formats = [
												'DD/MM/YYYY',
												'MM/DD/YYYY'
											],
											index1,index2,date1,date2;

										if (arguments.length === 3) {
											index1 = allowed_in_formats.indexOf(f1);
											date2 = moment(new Date());

											// check if the format is allowed
											if (index1 >= 0) {
												date1 = moment(d1, f1);

												return date2.diff(date1, m);
											}

										// 5 args means that two dates were given
										} else if (arguments.length === 5) {
											index1 = allowed_in_formats.indexOf(f1);
											index2 = allowed_in_formats.indexOf(f2);
											date1 = moment(d1, f1);
											date2 = moment(d2, f2);

											// check if the format is allowed
											if (index1 >= 0 && index2 >= 0) {
												date1 = moment(d1, f1);

												return date2.diff(date1, m);
											}
										}
											
										return false;

									},

									// if we are given a pad (integer), the 
									formatMoney: function (input) {
										var accounting = require("accounting");
										return accounting.formatMoney(input);
									},

									formatNumber: function (input, p, l) {
										var accounting = require("accounting");
										p = parseInt(p,10) || 2;
										l = l || ",";

										return accounting.formatNumber(input,p,l);
									},

									pad: function (n, width, z) {
										z = z || '0';
										n = n + '';
										return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
									},

									// this function is used to determine if we want to add a stylsheet or not
									// sometimes a stylesheet depends on a variable
									exit: function () {
										
										throw "exit";
									}
								} 
							});

							var now = Date.now();

							// this is where we write the temp file..a generated .fo or .fdf file.. only do this if the style sheet was generteated
							// this might be a loop for something like the sched of parties, which depends on how many parties are added in the interview
							fs.writeFile(config.loc.tmp + now + '.fo', stylesheet, function (err) {

								var cmd;

								if (err) {
									throw err;
								} else {


									// check to see what the output is and use the corresponding doc processor
									if (process.argv[5] === 'pdf_form') {
										
										// this will use pdftk to create a pdf that is filled
										//cmd = spawn('pdftk', [base_location + deliverable.input.form.path, 'fill_form', base_location + tmp_directory + tmp, 'output', base_location + out_directory  + out]);
										//spawn('pdftk', ['-fo', __dirname + 'fill_form' + now + '.fo', '-' + process.argv[5], __dirname + '/generated/' + process.argv[6]]);
									} else {
										// this runs the fop build command with the location specific to eitehr prod or dev
										cmd = spawn(config.loc.fop, ['-fo', config.loc.tmp + now + '.fo', '-' + process.argv[5], config.loc.generated + process.argv[6]]);
									}
									
									cmd.stdout.on('data', function (data) {
										//console.log(data);
										//files.push(out_directory + out);
									});

									cmd.stderr.on('data', function (data) {
										console.log('stderr: ' + data);
									});

									cmd.on('exit', function (code) {
										if (code !== 0) {
											// the stylesheet never finished
											callback('The stylesheet could not be processed.');

										} else {
											console.log('Success. Exit Code 0');
										}
									});

								}
							});	
						}
					});


				}
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





