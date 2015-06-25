/// <reference path="../typings/tsd.d.ts" />
	
var http: any = require("http");
var mime: any = require("mime");
var colors: any = require("colors");

module Demo {
	
	/**
	 * Demo server definition.
	 * This server is a very basic web server written in Node.js. It covers the needs
	 * of the Vector Video Screencast project demo and it is not designed for production use. 
	 */
	export class Server {
		/** Node.js file system library */
		private static fs: any;
	
		/** the HTTP server instance */
		private server: any;
	        
		/** request handling */
		private requestHandlers: Object = {
			"POST": {},
			"GET": {},
			"HEAD": {},
			"PUT": {},
			"DELETE": {}
		};
	    
		/**
		 * Client's may set a specific callback for a URL and request method.
		 * Only one callback may correspond to one URL and method.
		 */
		public AddRequestHandler(method: string, url: string, callback: (req, res) => void): void {
			method = method.toUpperCase();
			if (!this.requestHandlers.hasOwnProperty(method)) {
				console.log(colors.red(`Unknown method '${method}' can't register callback for '${url}'`));
				return;
			}

			if (this.requestHandlers[method].hasOwnProperty(url)) {
				console.log(colors.red(`There is already a handler for '${method}: ${url}`));
				return;
			}

			this.requestHandlers[method][url] = callback;
		}
	
		/**
		 * Configure a web server running o specified port.
		 * Files in 'publicRoot' folder will be served staticaly.
		 */
		constructor(private port: number, private publicRoot: string) {
			if (!Server.fs)					
				// file system Node.js library
				Server.fs = require("fs");
		}
	    
		/**
		 * Run the server with the configuration given in the constructor.
		 */
		public Start(): void {
			// prepare and run the demo HTTP server
			this.server = http.createServer((req, res) => this.HandleRequest(req, res));
			var port = this.port;
			this.server.listen(port, function() {
				console.log(colors.yellow(`DEMO server is running and listening at port ${port.toString() }`));
			});
		}
	    
		/**
		 * Decide what to do with client's request.
		 * - if there is a registered handler, execute it
		 * - if there is none, try to serve a static file
		 */
		private HandleRequest(req: any, res: any): void  {
			var method: string = req.method.toUpperCase();
			var url: string = req.url;

			if (!this.requestHandlers.hasOwnProperty(method)
				|| !this.requestHandlers[method].hasOwnProperty(url)) {

				if ((method !== "GET" && method !== "HEAD")
					|| this.TryServeStatic(req, res) === false) {

					console.log(colors.red(`NO HANDLER: '${method}: ${url}'`));
					this.Error404(url, res);
				}
					
				// either static file or 404 was served             
				return; // no need to do more
			} else {
				console.log(colors.blue(`handling request: '${method}: ${url}'`));
				this.requestHandlers[method][url].call(this, req, res);
				return;
			}
			
			// something happened, even 404 failed
			this.Error500(res);
		}
	    
		/**
		 * There is no explicit handler for this request
		 * - if there is a file in the "public" directory, that corresponds
		 *   to the url, serve it as response to the client.  
		 */
		private TryServeStatic(req: any, res: any): boolean {
			try {
				// real file name
				var filename: string = this.publicRoot + req.url;
				var stream: any = Server.fs.createReadStream(filename); // https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
				
				// try to identify the mime type of the file
				var type: string = mime.lookup(filename);
				if(!!type) {
					res.setHeader("Content-Type", type);
				}
				
				stream.pipe(res);
				console.log(colors.gray(`[${colors.green("OK")}] serving file ${filename}`));
				stream.on("error", (e) => {
					console.log(`[${colors.red("XX")}] serving error '${e}'`);
					this.Error404(req.url, res); // file doesn't exist or is corrupted
				});
				return true;
			} catch (e) {
				console.log(colors.red(`exception while creating file stream: ${e}`));
				// something happened - fail
				return false;
			}
		}
		
		/**
		 * Send a 404 error response
		 * http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_Error
		 */
		private Error404(url: string, res: any): void {
			res.statusCode = 404;
			res.statusMessage = "Not Found";
			res.write(`Error 404: '${url}' was not found`, "utf-8");
			res.end();
		}
		
		/**
		 * Send a 500 error message
		 * http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#5xx_Server_Error
		 */
		private Error500(res: any): void {
			res.statusCode = 500;
			res.statusMessage = "Internal Server Error";
			res.write("Error 500: Internal Server Error", "utf-8");
			res.end();
		}
	}
}

module.exports = Demo.Server;