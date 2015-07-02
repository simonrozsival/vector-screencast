/// <reference path="../typings/node/node.d.ts"/>
/**
 * Application serving the whole page.
 * Please take in mind that this just a DEMO.
 */

var fs = require("fs"); // file system Node.js library
var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = getPort(),
    publicDir = __dirname + '/public',
	dataRoot = "/recordings"; // the directory, where the recordings are stored

//app.post("/upload/result", UploadResult);

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static(publicDir));
app.use(errorHandler({
	dumpExceptions: true,
	showStack: true
}));

console.log("DEMO server is listening at http://%s:%s", hostname, port);
app.listen(port, hostname);


/**
 * This function will load the port from the first argument of the script,
 * or a default port value will be selected instead.
 * @return {number}	Port number
 */
function getPort() {
	var defaultPort = 3000;
	var port = null;

	if (process.argv.length > 2) {
		port = Number(process.argv[2]);
		if (!port) {
			// invalid port - coudn't be parsed
			port = defaultPort; // fallback
			console.log("The value '" + process.argv[2] + "' isn't a valid port number. Port has been set to " + port + " instead.");
		}
	} else {
		port = defaultPort; // the default value
		console.log("\nDefault port value has been set to " + port + ". You can specify different port by passing it as the first argument when starting the server next time.\n");
	}

	return port;
}

/**
 * Handle upload request
 * @param req	HTTP request object
 * @param res	HTTP response object
 */
function UploadResult(req, res) {
    var name = GenerateRandomFileName();
    var fileName = publicRoot + dataRoot + "/" + name; // real path of the file on the disk
	
	console.log("UploadResult(req, res) req dump:");
	console.log(req);
	
	// req.on("end", function() {
	// 	// due to the protocol, request body will be the recording XML file
	// 	// audio files are already uploaded and references to them are inside the XML
	//     fs.writeFile(fileName, data, function(err) {
	//         if (!!err) { // !! - convert value to boolean
	//             console.log("can't write file");
	// 			res.status(500).send("Error 500: Internal Server Error", "utf-8");
	// 			return;
	//         }
	//     
	//         // upload was successful - send a JSON response with a redirect 
	//         console.log("upload finished " + name);
	//         res.json({
	// 			success: true,
	// 			redirect: '/play.html?source=" + dataRoot + "/" + name + "'
	// 		});
	//     });		
	// });
}

/**
 * Generates a random file name to prevent collisions
 * @return 	{string}	File name
 */
function GenerateRandomFileName() {
	return "rec-" + Date.now() + "-" + Math.floor(Math.random() * 10000) + ".svg";
}