/// <reference path="node.d.ts" />
/// <reference path="DemoServer.ts" />

/**
 * Application serving the whole page.
 * Please take in mind that this just a DEMO.
 */

// There might be one argument - the port. Default value is 3000
var port: number = null;
var defaultPort: number = 3000;

if(process.argv.length > 2) {
    port = Number(process.argv[2]);
    if(!port) {
        // invalid port - coudn't be parsed
        port = defaultPort; // fallback
        console.log("The value '" + process.argv[2] + "' isn't a valid port number. Port has been set to " + port + " instead.");
    }
} else {
    port = defaultPort; // the default value
    console.log("Default port value has been set to " + port + ". You can specify different port by passing it as the first argument of " + process.argv[1] + " next time.");
} 


// prepare the HTTP server
var http = require("http");
// file system Node.js library
var fs = require("fs");

// the directory, where the recordings are stored
var publicRoot: string = "./public";
var dataRoot: string = "/recordings";

// prepare the DEMO server
var server: Demo.Server = new Demo.Server(port, publicRoot);
server.AddRequestHandler("POST", "/upload/result", UploadResult);
// start the server
server.Start();

/**
 * Handle upload request
 */
function UploadResult(req, res) : void {    
    console.log("\nIncomming result:");
    var name = "blablabla.svg";
    
    // write the incomming file into a SVG file
    var fileName = publicRoot + dataRoot + "/" + name;
    fs.writeFile(fileName, req.body, function(err) {
        if (err) {
            console.log("can't write file");
            res.status(500); // error
            res.json({
                success: false
            });
            return;
        }        
    
        // done
        console.log("Finished uploading " + name);
        res.json({
            success: true,
            redirect: "/play/" + name
        });
    });
}