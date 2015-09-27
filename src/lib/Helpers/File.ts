import HTML from './HTML';

//namespace VectorScreencast.Helpers {
	
	/**
	 * File helper
	 */
	export default class File {
		
		/**
		 * Checks, if request was successful and if the MIME type is matching (if requested)
		 */
		private static Check(req: XMLHttpRequest, mimeType?: string) : boolean {
			return req.status === 200 
						// if the mime type parameter is specified, check if it is matched
						&& !!mimeType ? req.getResponseHeader("ContentType") === mimeType : true; // !! - convert to boolean
		}
		
		/**
		 * Check, if there is an existing file on the specified url.
		 * This function is blocking.
		 */
		public static Exists(url: string, mimeType?: string) : boolean {
			var req = new XMLHttpRequest();
			req.open("HEAD", url, false);
			req.send();			
			return this.Check(req, mimeType);	
		}
		
		/**
		 * Check, if there is an existing file on the specified url.
		 * This function is not blocking.
		 */
		public static ExistsAsync(url: string, success: (e: Event) => any, error: (e: Event) => any, mimeType?: string) : void {
			var req = new XMLHttpRequest();
			req.open("HEAD", url, true);
			req.onerror = error;
			req.ontimeout = error;
			req.onload = (e) => {
				if(this.Check(req, mimeType)) {
					success(e);
				} else {
					error(e);
				}
			};
			req.send();
		}
		
		/**
		 * Asynchronousely open a file.
		 * @param 	url		File URL
		 * @param	success	Success callback
		 * @param 	error	Error callback		
		 */
		public static ReadFileAsync(url: string, success: (data: any) => any, error: (errStatus: number) => any) : void {
			var req = new XMLHttpRequest();
			req.open("GET", url, true);
			req.onerror = (e) => error(req.status);
			req.ontimeout = (e) => error(req.status);
			req.onload = (e) => {
				if(req.status === 200) {
					success(!!req.responseXML ? req.responseXML : req.response);
				} else {
					error(req.status);
				}
			};
			req.send();
		}
				
		/**
		 * Asynchronousely open and parse an XML file.
		 * @param 	url		File URL
		 * @param	success	Success callback
		 * @param 	error	Error callback		
		 */
		public static ReadXmlAsync(url: string, success: (xml: XMLDocument) => any, error: (errStatus: number) => any) : void {
			var req = new XMLHttpRequest();
			req.open("GET", url, true);
			req.onerror = (e) => error(req.status);
			req.ontimeout = (e) => error(req.status);
			req.onload = (e) => {
				if(req.status === 200) {
					success(<XMLDocument> req.responseXML);
				} else {
					error(req.status);
				}
			};
			req.send();
		}
		
		/**
		 * Download a Blob with a specified name
		 */
		public static Download(blob: Blob, name: string) : void {
			// create a hidden link
			var a = HTML.CreateElement("a", {
				css: "display: none"
			});
			document.documentElement.appendChild(a);
			
			var url = URL.createObjectURL(blob);
			HTML.SetAttributes(a, {
				href:		url,
				download:	name
			});
			
			a.click(); // initiate download
			URL.revokeObjectURL(url);
		}
		
		/**
		 * Current time in this format: "mm-dd-YYYY_H-i"
		 */
		private static CurrentDateTime() : string {
			var date: Date = new Date();
			return "$(date.getMonth())-$(date.getDay())-$(date.getFullYear())_$(date.getHour())-$(date.getMinute())"; 
		}
	
		/**
		 * Download a WAV file
		 */
		public static StartDownloadingWav(blob: Blob) {
			File.Download(blob, "recording-" + File.CurrentDateTime() + ".wav");
		}

		/**
		 * Download an XML file
		 */
		public static StartDownloadingXml(text: string) {
			var blob: Blob = new Blob([text], { type: "text/xml" });
			File.Download(blob, "data-" + File.CurrentDateTime() + ".xml");
		}
		
	}
	
//}