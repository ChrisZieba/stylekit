# Stylekit

A JavaScript replacement for creating dynamic documents with XML and XSL.

Conceived by and maintained by [Chris Zieba](http://chriszieba.com). This project is currently being used in [LogicPull](http://www.logicpull.com).

## Configuration

Stylkit comes with a configuration file ``config.js``. This can be used to set the location of the Apache FOP executable, as well as the directory location for inputs and generated files.

The directory ``generated`` must be writable.

## Example JSON Data Set

Objects are passed into the template file and can be called using the master object ``<%master["IM_Client_FirstName"].getAnswer()%>``. For a more complete example of a compatible data set take a look at ``answers/example.json``

```
{
	"IM_Client_FirstName": {
	    "qid": "q48",
	    "loop": false,
	    "name": "IM_Client_FirstName",
	    "section": "field",
	    "type": "text",
	    "values": {
	        "IM_Client_FirstName": "Chris",
	        "label": {}
	    },
	    "question": {},
	    "label": "First name:"
	}
	...
}
```

## Templates

For more information on the syntax used in an ejs tempalte, please take a look at the [documentation](https://code.google.com/p/embeddedjavascript/w/list).

### Helpers

Stylekit comes with some helper functions that are passed into the template, which can be used to assist with output generation.

Takes a string and sets the first character to uppercase.
``capitalize: function (string)``

Take a number and round to the nearest decimal.
``round: function (number)``

Return the ordinal (third, fourth, etc...) of a given ``index``
``numberWord: function (index)``

Return the ordinal of a given index. If ``num`` is given then the ordinal is in dispaly format 1st, instead of first.
``ordinal: function (index, num)``
	

This function takes the name of the checkbox, and the id of the one we want to evaluate.
``id`` can be a single value or an array. ``name`` the name of the field - STRING. ``id`` is the id of the checkbox [can be an array of id's] To check for NOTA just pass in 'nota' as the id.
``isChecked: function (name, id, index)``

Checks if a variable was answered and has a value (not empty string). ``index`` is an optional parameter used when in a loop to check if an answer in a loop was answered. ``name`` can be an array of names to check, it is the variable not a string.
``isAnswered: function (name, index)``

Sugar for master['var'].getAnswer(). ``index`` is an optional array index to grab a looped variable.
``get: function (name, index)``

Takes in ``date``, and an ``in_format``, and outputs the date in a different format, given by ``out_format``. ``date`` is the date string and format is the format of the string given to us, and out is the format we want the string in.
``dateFormat : function (date, in_format, out_format)``

The first two args are mandatory, and if the last two are not given we set the date to today
``m`` is the unit for the difference, ie. 'days'. To check if a ``d2`` comes after ``d1`` use ``('12/24/1977', 'MM/DD/YYYY', 'days', '01/01/2012', 'MM/DD/YYYY')  > 0``. This will be zero if they are same date, negative if the first date and if the second date parameer is after the first, than the result will be positive.
``dateDifference : function (d1, f1, m, d2, f2)``

For more information on formatMoney please visit the [accounting docs](http://josscrowcroft.github.io/accounting.js/)
``formatMoney: function (input)``

For more information on formatNumber please visit the [accounting docs](http://josscrowcroft.github.io/accounting.js/)
``formatNumber: function (input, p, l)``

Pad a string with z characters totalling the width
``pad: function (n, width, z)``

This function is used to determine if we want to add a stylsheet or not. Sometimes a stylesheet depends on a variable so we need to stop processing the style sheet and exit without completing.
``exit: function ()``

## Dependencies

Stylekit requires [Apache FOP](http://xmlgraphics.apache.org/fop/), and [nodejs](http://nodejs.org/).

## Usage

Before getting started please be sure to install Apache Fop, and set its path in ``config.js``.

``$ node app.js <answers filename [*.json]> <input type [fo|pdf_form]> <stylesheet [*.ejs]> <output type [pdf|rtf]> <output filename>``

Takes as input, a JSON file containing the data set, an intermideiate output type (fo) and the ejs template file to use. Ouputs a final document in RTF.

``$ node app.js data.json fo template.ejs rtf final.rtf``

The final output that is generated will be placed in the ``generated`` folder by default.

## Licence

Stylekit is released under the MIT license:
[opensource.org/licenses/MIT](http://opensource.org/licenses/MIT)

## Author

@ChrisZieba 