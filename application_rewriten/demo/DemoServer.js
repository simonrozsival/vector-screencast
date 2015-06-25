/// <reference path="../typings/tsd.d.ts" />
var http = require("http");
var mime = require("mime");
var colors = require("colors");
var Demo;
(function (Demo) {
    /**
     * Demo server definition.
     * This server is a very basic web server written in Node.js. It covers the needs
     * of the Vector Video Screencast project demo and it is not designed for production use.
     */
    var Server = (function () {
        /**
         * Configure a web server running o specified port.
         * Files in 'publicRoot' folder will be served staticaly.
         */
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
        /**
         * Client's may set a specific callback for a URL and request method.
         * Only one callback may correspond to one URL and method.
         */
        Server.prototype.AddRequestHandler = function (method, url, callback) {
            method = method.toUpperCase();
            if (!this.requestHandlers.hasOwnProperty(method)) {
                console.log(colors.red("Unknown method '" + method + "' can't register callback for '" + url + "'"));
                return;
            }
            if (this.requestHandlers[method].hasOwnProperty(url)) {
                console.log(colors.red("There is already a handler for '" + method + ": " + url));
                return;
            }
            this.requestHandlers[method][url] = callback;
        };
        /**
         * Run the server with the configuration given in the constructor.
         */
        Server.prototype.Start = function () {
            var _this = this;
            // prepare and run the demo HTTP server
            this.server = http.createServer(function (req, res) { return _this.HandleRequest(req, res); });
            var port = this.port;
            this.server.listen(port, function () {
                console.log(colors.yellow("DEMO server is running and listening at port " + port.toString()));
            });
        };
        /**
         * Decide what to do with client's request.
         * - if there is a registered handler, execute it
         * - if there is none, try to serve a static file
         */
        Server.prototype.HandleRequest = function (req, res) {
            var method = req.method.toUpperCase();
            var url = req.url;
            if (!this.requestHandlers.hasOwnProperty(method)
                || !this.requestHandlers[method].hasOwnProperty(url)) {
                if ((method !== "GET" && method !== "HEAD")
                    || this.TryServeStatic(req, res) === false) {
                    console.log(colors.red("NO HANDLER: '" + method + ": " + url + "'"));
                    this.Error404(url, res);
                }
                // either static file or 404 was served             
                return; // no need to do more
            }
            else {
                console.log(colors.blue("handling request: '" + method + ": " + url + "'"));
                this.requestHandlers[method][url].call(this, req, res);
                return;
            }
            // something happened, even 404 failed
            this.Error500(res);
        };
        /**
         * There is no explicit handler for this request
         * - if there is a file in the "public" directory, that corresponds
         *   to the url, serve it as response to the client.
         */
        Server.prototype.TryServeStatic = function (req, res) {
            var _this = this;
            try {
                // real file name
                var filename = this.publicRoot + req.url;
                var stream = Server.fs.createReadStream(filename); // https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
                // try to identify the mime type of the file
                var type = mime.lookup(filename);
                if (!!type) {
                    res.setHeader("Content-Type", type);
                }
                stream.pipe(res);
                console.log(colors.gray("[" + colors.green("OK") + "] serving file " + filename));
                stream.on("error", function (e) {
                    console.log("[" + colors.red("XX") + "] serving error '" + e + "'");
                    _this.Error404(req.url, res); // file doesn't exist or is corrupted
                });
                return true;
            }
            catch (e) {
                console.log(colors.red("exception while creating file stream: " + e));
                // something happened - fail
                return false;
            }
        };
        /**
         * Send a 404 error response
         * http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_Error
         */
        Server.prototype.Error404 = function (url, res) {
            res.statusCode = 404;
            res.statusMessage = "Not Found";
            res.write("Error 404: '" + url + "' was not found", "utf-8");
            res.end();
        };
        /**
         * Send a 500 error message
         * http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#5xx_Server_Error
         */
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
module.exports = Demo.Server;
//# sourceMappingURL=DemoServer.js.map