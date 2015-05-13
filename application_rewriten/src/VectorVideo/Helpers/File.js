/// <reference path="HTML" />
var Helpers;
(function (Helpers) {
    /**
     * File helper
     */
    var File = (function () {
        function File() {
        }
        /**
         * Checks, if request was successful and if the MIME type is matching (if requested)
         */
        File.Check = function (req, mimeType) {
            return req.status === 200
                && !!mimeType ? req.getResponseHeader("ContentType") === mimeType : true; // !! - convert to boolean
        };
        /**
         * Check, if there is an existing file on the specified url.
         * This function is blocking.
         */
        File.Exists = function (url, mimeType) {
            var req = new XMLHttpRequest();
            req.open("HEAD", url, false);
            req.send();
            return this.Check(req, mimeType);
        };
        /**
         * Check, if there is an existing file on the specified url.
         * This function is not blocking.
         */
        File.ExistsAsync = function (url, success, error, mimeType) {
            var _this = this;
            var req = new XMLHttpRequest();
            req.open("HEAD", url, true);
            req.onerror = error;
            req.ontimeout = error;
            req.onload = function (e) {
                if (_this.Check(req, mimeType)) {
                    success(e);
                }
                else {
                    error(e);
                }
            };
            req.send();
        };
        /**
         * Asynchronousely open and parse an XML file.
         * @param 	url		File URL
         * @param	success	Success callback
         * @param 	error	Error callback
         */
        File.ReadXmlAsync = function (url, success, error) {
            var req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.onerror = function (e) { return error(); };
            req.ontimeout = function (e) { return error(); };
            req.onload = function (e) {
                if (req.status === 200) {
                    success(req.responseXML);
                }
                else {
                    error();
                }
            };
        };
        /**
         * Download a Blob with a specified name
         */
        File.Download = function (blob, name) {
            // create a hidden link
            var a = Helpers.HTML.CreateElement("a", {
                css: "display: none"
            });
            document.appendChild(a);
            var url = URL.createObjectURL(blob);
            Helpers.HTML.SetAttributes(a, {
                href: url,
                download: name
            });
            a.click(); // initiate download
            URL.revokeObjectURL(url);
        };
        /**
         * Current time in this format: "mm-dd-YYYY_H-i"
         */
        File.CurrentDateTime = function () {
            var date = new Date();
            return "$(date.getMonth())-$(date.getDay())-$(date.getFullYear())_$(date.getHour())-$(date.getMinute())";
        };
        /**
         * Download a WAV file
         */
        File.StartDownloadingWav = function (blob) {
            File.Download(blob, "recording-" + File.CurrentDateTime() + ".wav");
        };
        /**
         * Download an XML file
         */
        File.StartDownloadingXml = function (text) {
            var blob = new Blob([text], { type: "text/xml" });
            File.Download(blob, "data-" + File.CurrentDateTime() + ".xml");
        };
        return File;
    })();
    Helpers.File = File;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=File.js.map