# Stylekit

Create dynamic documents with XML and XSL.

Created and maintained by [Chris Zieba](http://chriszieba.com). This project is currently being used in [LogicPull](https://www.logicpull.com). For more information on how to use stylekit, please see this LogicPull [help article](http://help.logicpull.com/portal/articles/working-with-templates).

## Configuration

Stylkit comes with a configuration file ``config.js``. This can be used to set the location of the Apache FOP executable, as well as the directory location for inputs and generated files.

The directory ``generated`` must be writable. Stylekit looks for stylesheets and pdf_forms in the `stylesheets` directory, so it must exist and be writable.

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

For more information on the syntax used in an ejs template, please take a look at the [documentationn](http://help.logicpull.com/portal/articles/working-with-templates).

### Helpers

Stylekit comes with some helper functions that are passed into the template, which can be used to assist with output generation. For more information, please refer to the [documentation](http://help.logicpull.com/docs).


## Dependencies

Stylekit requires [Apache FOP](http://xmlgraphics.apache.org/fop/), and [nodejs](http://nodejs.org/).

If you are generating Fillable PDF Forms, then you need to have [PDFTK Server](http://www.pdflabs.com/tools/pdftk-server/) installed and on your path. 

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

[@ChrisZieba](https://www.twitter.com/ChrisZieba) 