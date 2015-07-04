/**
 * DEMO audio recording server setup
 */
var AudioServer = require("./AudioServer");

var port = process.argv.length > 2 ? parseInt(process.argv[2]) : 4000;
if(process.argv.length <= 2) {
	console.log("\nDEMO Audio server is running on the default port 4000, you can set the port number explicitely as the first argument when starting the server.\n");	
}

var server = new AudioServer({
    port: port,
    path: "/upload/audio",
    outputDir: "./public/recordings",
    format: [ "mp3", "ogg" ]
});

// that's it