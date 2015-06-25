/// <reference path="../typings/node/node.d.ts"/>
/**
 * Application serving the whole page.
 * Please take in mind that this just a DEMO.
 */

// load external libraries
var http = require("http"); // HTTP server Node.js library
var fs = require("fs"); // file system Node.js library
var Server = require("./DemoServer.js"); // the DEMO server

// prepare important values
var port = getPort(); // There might be one argument - the port. Default value is 3000
var publicRoot = __dirname + "/public"; // root directory
var dataRoot = "/recordings"; // the directory, where the recordings are stored

// prepare and run the DEMO server
var server = new Server(port, publicRoot);
server.AddRequestHandler("POST", "/upload/result", UploadResult);
server.Start();


/**
 * This function will load the port from the first argument of the script,
 * or a default port value will be selected instead.
 * @return {number}	Port number
 */
function getPort() {
	var defaultPort = 3000;
	var port = null;
	
	if(process.argv.length > 2) {
	    port = Number(process.argv[2]);
	    if(!port) {
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
    console.log("\nIncomming result:");
    var name = GenerateRandomFileName();
    var fileName = publicRoot + dataRoot + "/" + name; // real path of the file on the disk
    
	// due to the protocol, request body will be the recording XML file
	// audio files are already uploaded and references to them are inside the XML
    fs.writeFile(fileName, req.body, function(err) {
        if (!!err) { // !! - convert value to boolean
            console.log("can't write file");
			res.statusCode = 500;
			res.statusMessage = "Internal Server Error";
			res.write("Error 500: Internal Server Error", "utf-8");
			res.end();
            return;
        }
    
        // upload was successful - send a JSON response with a redirect 
        console.log("upload finished " + name);
		res.setHeader("content-type", "application/json");
        res.write("{ success: true, redirect: '/play.html?source=" + name + "' }", "utf-8");
		res.end();
    });
}

/**
 * Generates a random file name to prevent collisions
 * @return 	{string}	File name
 */
function GenerateRandomFileName() {
	return "rec-" + Date.now() + "-" + Math.floor(Math.random() * 10000) + ".svg";
}