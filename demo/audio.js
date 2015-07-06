/**
 * DEMO audio recording server setup
 */
var AudioServer = require("./AudioServer");

if(process.argv.length <= 2) {
	console.log("Host name argument is missing. Specify the host name in the first argument");	
} else {
	var hostName = process.argv[2];
	var port = process.argv.length > 3 ? parseInt(process.argv[3]) : 4000;
	if(process.argv.length <= 3) {
		console.log("\nDEMO Audio server is running on the default port 4000, you can set the port number explicitely as the first argument when starting the server.\n");	
	}
	
	var server = new AudioServer({
		hostName: hostName,
	    port: port,
	    path: "/upload/audio",
	    outputDir: "./public/recordings",
	    format: [ "mp3", "ogg" ]
	});	
	// that's it
}