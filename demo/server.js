/**
 * Application serving the whole page.
 * Please take in mind that this just a DEMO.
 */

var fs = require("fs"); // file system Node.js library
var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
	formidable = require('formidable'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
	compression = require('compression'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = getPort(),
    publicDir = __dirname + '/public',
	dataRoot = "/recordings"; // the directory, where the recordings are stored

app.post("/upload/result", UploadResult);
app.post("/save", SaveRecording);

app.use(compression());
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.raw());
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
    var form = new formidable.IncomingForm();
	form.uploadDir = publicDir + dataRoot;
	form.parse(req, function(err, fields, files) {
		if(!!err) {
			res.status(500).json({ success: false });
			return;
		}
		
		var ext = encodeURIComponent(fields.extension);
		var tmpName = files.file.path;
		var newName = dataRoot + "/" + GenerateRandomFileName(ext);
		fs.renameSync(tmpName, publicDir + newName);
		res.status(200).json({
			success: true,
			redirect: "/save.html?source=" + newName			
		})
	});
}

var dbFile = "./public/recordings-list.json";
function SaveRecording(req, res) {		
	
    var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {		
		var recording = {
			src:	encodeURIComponent(fields.source),
			author:	encodeURIComponent(fields.author),
			title: 	encodeURIComponent(fields.title),
			tags:	fields.tags.split(",").map(function(tag) { return encodeURIComponent(tag.trim()); })
		};
		
		fs.readFile(dbFile, "utf8", function(err, data) {
			if(!!err) {			
				res.status(500).json({ success: false, msg: "can't  open the DB" });
				return;
			}
			var db = JSON.parse(data);
			if(!db || !db.hasOwnProperty("recordings") || !Array.isArray(db.recordings)) {
				res.status(500).json({ success: false, msg: "DB is corrupted" });
				return;
			}
			
			db.recordings.push(recording);
			fs.writeFile(dbFile, JSON.stringify(db), function(err) {
				if(!!err) {					
					res.status(500).json({ success: false, msg: "Can't write to the DB" });
					return;
				}			
				
				res.redirect("/play.html?source=" + decodeURIComponent(recording.src));
				return;
			});
		});
	});
}

/**
 * Generates a random file name to prevent collisions
 * @return 	{string}	File name
 */
function GenerateRandomFileName(ext) {
	ext = ext || "svg";
	return "rec-" + Date.now() + "-" + Math.floor(Math.random() * 10000) + "." + ext;
}