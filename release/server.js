var Demo;
(function (Demo) {
    /**
     * Demo server definition
     */
    var Server = (function () {
        function Server(port, publicRoot) {
            this.port = port;
            this.publicRoot = publicRoot;
            /** request handling */
            this.requestHandlers = {
                "POST": {},
                "GET": {},
                "HEAD": {},
                "PUT": {},
                "DELETE": {}
            };
            if (!Server.fs)
                // file system Node.js library
                Server.fs = require("fs");
        }
        Server.prototype.AddRequestHandler = function (method, url, callback) {
            method = method.toUpperCase();
            if (!this.requestHandlers.hasOwnProperty(method)) {
                console.log("Unknown method '" + method + "' can't register callback for '" + url + "'");
                return;
            }
            if (this.requestHandlers[method].hasOwnProperty(url)) {
                console.log("There is already a handler for '" + method + ": " + url);
                return;
            }
            this.requestHandlers[method][url] = callback;
        };
        Server.prototype.Start = function () {
            var _this = this;
            // prepare and run the demo HTTP server
            this.server = http.createServer(function (req, res) { return _this.HandleRequest(req, res); });
            var port = this.port;
            this.server.listen(port, function () {
                console.log("App server is running at port " + port.toString());
            });
        };
        Server.prototype.HandleRequest = function (req, res) {
            var method = req.method.toUpperCase();
            var url = req.url;
            if (!this.requestHandlers.hasOwnProperty(method)
                || !this.requestHandlers[method].hasOwnProperty(url)) {
                if ((method !== "GET" && method !== "HEAD")
                    || this.TryServeStatic(req, res) === false) {
                    console.log("NO HANDLER: '" + method + ": " + url + "'");
                    this.Error404(res);
                }
                // either static file or 404 was served             
                return; // no need to do more
            }
            else {
                console.log("handling request: '" + method + ": " + url + "'");
                this.requestHandlers[method][url].call(this, req, res);
            }
            // something happened, even 404 failed
            this.Error500(res);
        };
        Server.prototype.TryServeStatic = function (req, res) {
            var _this = this;
            try {
                // real file name
                var filename = this.publicRoot + req.url;
                //var file: any = Server.fs.openSync(filename, "r");
                //var stats: any = Server.fs.fstatSync(file); // https://nodejs.org/api/fs.html#fs_fs_fstatsync_fd
                //if(!stats.isFile()) {
                //	return false;
                //}
                var stream = Server.fs.createReadStream(filename); // https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
                stream.pipe(res);
                console.log("serving file " + filename);
                stream.on("error", function (e) {
                    console.log("serving error '" + e + "'");
                    _this.Error404(res); // file doesn't exist or is corrupted
                });
                return true;
            }
            catch (e) {
                console.log("exception while creating file stream: " + e);
                // something happened
                return false;
            }
        };
        Server.prototype.Error404 = function (res) {
            res.statusCode = 404;
            res.statusMessage = "Not Found";
            res.write("Error 404: Not Found", "utf-8");
            res.end();
        };
        Server.prototype.Error500 = function (res) {
            res.statusCode = 500;
            res.statusMessage = "Internal Server Error";
            res.write("Error 500: Internal Server Error", "utf-8");
            res.end();
        };
        return Server;
    })();
    Demo.Server = Server;
})(Demo || (Demo = {}));
/// <reference path="node.d.ts" />
/// <reference path="DemoServer.ts" />
/**
 * Application serving the whole page.
 * Please take in mind that this just a DEMO.
 */
// There might be one argument - the port. Default value is 3000
var port = null;
var defaultPort = 3000;
if (process.argv.length > 2) {
    port = Number(process.argv[2]);
    if (!port) {
        // invalid port - coudn't be parsed
        port = defaultPort; // fallback
        console.log("The value '" + process.argv[2] + "' isn't a valid port number. Port has been set to " + port + " instead.");
    }
}
else {
    port = defaultPort; // the default value
    console.log("Default port value has been set to " + port + ". You can specify different port by passing it as the first argument of " + process.argv[1] + " next time.");
}
// prepare the HTTP server
var http = require("http");
// file system Node.js library
var fs = require("fs");
// the directory, where the recordings are stored
var publicRoot = "./public";
var dataRoot = "/recordings";
// prepare the DEMO server
var server = new Demo.Server(port, publicRoot);
server.AddRequestHandler("POST", "/upload/result", UploadResult);
// start the server
server.Start();
/**
 * Handle upload request
 */
function UploadResult(req, res) {
    console.log("\nIncomming result:");
    var name = "blablabla.svg";
    // write the incomming file into a SVG file
    var fileName = publicRoot + dataRoot + "/" + name;
    fs.writeFile(fileName, req.body, function (err) {
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
