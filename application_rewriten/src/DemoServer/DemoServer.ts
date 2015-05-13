module Demo {

	
	/**
	 * Demo server definition
	 */
	export class Server {
		/** Node.js file system library */	    
		private static fs: any;
	
	    /** the HTTP server instance */
	    private server: any;
	        
	    /** request handling */
	    private requestHandlers: Object = {
	        "POST":     {},
	        "GET":      {},
	        "HEAD":     {},
	        "PUT":      {},
	        "DELETE":   {}
	    };
	    
	    public AddRequestHandler(method: string, url: string, callback: (req, res) => void) : void {
	        method = method.toUpperCase();
	        if(!this.requestHandlers.hasOwnProperty(method)) {
	            console.log(`Unknown method '${method}' can't register callback for '${url}'`);
	            return;
	        }
	        
	        if(this.requestHandlers[method].hasOwnProperty(url)) {
	            console.log(`There is already a handler for '${method}: ${url}`);
	            return;
	        }
	        
	        this.requestHandlers[method][url] = callback;
	    }
	
	    constructor(private port: number, private publicRoot: string) {
			if(!Server.fs)					
			// file system Node.js library
			Server.fs = require("fs");
		}
	    
	    public Start() : void {
	        // prepare and run the demo HTTP server
	        this.server = http.createServer((req, res) => this.HandleRequest(req, res));
			var port = this.port;
	        this.server.listen(port, function() {
	            console.log(`App server is running at port ${port.toString()}`);    
	        });
	    }
	    
	    private HandleRequest(req: any, res: any) : void {
			var method: string = req.method.toUpperCase();
	        var url: string = req.url;
	        
	        if(!this.requestHandlers.hasOwnProperty(method)
	            || !this.requestHandlers[method].hasOwnProperty(url)) {
	            
	            if((method !== "GET" && method !== "HEAD")
	                || this.TryServeStatic(req, res) === false) {
	                    
	                    console.log(`NO HANDLER: '${method}: ${url}'`);
						this.Error404(res);
	                }
					
					// either static file or 404 was served             
					return; // no need to do more
	        } else {
				console.log(`handling request: '${method}: ${url}'`);
	        	this.requestHandlers[method][url].call(this, req, res);	
			}
			
			// something happened, even 404 failed
			this.Error500(res);
	    }
	    
	    private TryServeStatic(req: any, res: any) : boolean {
			try {
				// real file name
				var filename: string = this.publicRoot + req.url;
				//var file: any = Server.fs.openSync(filename, "r");
				//var stats: any = Server.fs.fstatSync(file); // https://nodejs.org/api/fs.html#fs_fs_fstatsync_fd
				//if(!stats.isFile()) {
				//	return false;
				//}
						
				var stream: any = Server.fs.createReadStream(filename); // https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
				stream.pipe(res);
				console.log(`serving file ${filename}`);
				stream.on("error", (e) => {
					console.log(`serving error '${e}'`);
					this.Error404(res); // file doesn't exist or is corrupted
				});
				return true;
			} catch (e) {
				console.log(`exception while creating file stream: ${e}`);
				// something happened
				return false;
			}
	    }
		
		private Error404(res: any) : void {			
			res.statusCode = 404;
			res.statusMessage = "Not Found";
			res.write("Error 404: Not Found", "utf-8");
			res.end();
		}
		
		private Error500(res: any) : void {
			res.statusCode = 500;
			res.statusMessage = "Internal Server Error";
			res.write("Error 500: Internal Server Error", "utf-8");
			res.end();
		}
	}
}