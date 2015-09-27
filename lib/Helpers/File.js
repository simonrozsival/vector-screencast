var HTML_1 = require('./HTML');
var File = (function () {
    function File() {
    }
    File.Check = function (req, mimeType) {
        return req.status === 200
            && !!mimeType ? req.getResponseHeader("ContentType") === mimeType : true;
    };
    File.Exists = function (url, mimeType) {
        var req = new XMLHttpRequest();
        req.open("HEAD", url, false);
        req.send();
        return this.Check(req, mimeType);
    };
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
    File.ReadFileAsync = function (url, success, error) {
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.onerror = function (e) { return error(req.status); };
        req.ontimeout = function (e) { return error(req.status); };
        req.onload = function (e) {
            if (req.status === 200) {
                success(!!req.responseXML ? req.responseXML : req.response);
            }
            else {
                error(req.status);
            }
        };
        req.send();
    };
    File.ReadXmlAsync = function (url, success, error) {
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.onerror = function (e) { return error(req.status); };
        req.ontimeout = function (e) { return error(req.status); };
        req.onload = function (e) {
            if (req.status === 200) {
                success(req.responseXML);
            }
            else {
                error(req.status);
            }
        };
        req.send();
    };
    File.Download = function (blob, name) {
        var a = HTML_1.default.CreateElement("a", {
            css: "display: none"
        });
        document.documentElement.appendChild(a);
        var url = URL.createObjectURL(blob);
        HTML_1.default.SetAttributes(a, {
            href: url,
            download: name
        });
        a.click();
        URL.revokeObjectURL(url);
    };
    File.CurrentDateTime = function () {
        var date = new Date();
        return "$(date.getMonth())-$(date.getDay())-$(date.getFullYear())_$(date.getHour())-$(date.getMinute())";
    };
    File.StartDownloadingWav = function (blob) {
        File.Download(blob, "recording-" + File.CurrentDateTime() + ".wav");
    };
    File.StartDownloadingXml = function (text) {
        var blob = new Blob([text], { type: "text/xml" });
        File.Download(blob, "data-" + File.CurrentDateTime() + ".xml");
    };
    return File;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = File;
