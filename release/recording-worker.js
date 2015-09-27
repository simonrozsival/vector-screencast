/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	var CMD_INIT = "init";
	var CMD_PUSH_DATA = "pushData";
	var CMD_FINISH = "finish";
	function error(msg) {
	    console.log("Recording Worker error: " + msg);
	    this.postMessage({ type: "error", msg: msg });
	}
	var audioProcessor = null;
	this.onmessage = function (e) {
	    var _this = this;
	    var msg = e.data;
	    if (!msg.hasOwnProperty("cmd")) {
	        console.log("Recording Worker error: message does not contain 'cmd' property.");
	    }
	    try {
	        switch (msg.cmd) {
	            case CMD_INIT:
	                audioProcessor = new BinaryAudioStreamingProcessor({
	                    host: msg.host,
	                    port: msg.port,
	                    path: msg.path,
	                    secured: false,
	                    opened: function () { return console.log("Streaming was initialised successfully."); },
	                    finished: function (files) { return _this.postMessage({ type: "finished", files: files }); },
	                    error: function () { return error("Can't init audio processor"); }
	                });
	                break;
	            case CMD_PUSH_DATA:
	                if (!audioProcessor.PushData(msg.data)) {
	                    this.postMessage({ type: "network-error" });
	                }
	                break;
	            case CMD_FINISH:
	                audioProcessor.Finish({
	                    success: function (data) { return _this.postMessage({ error: false, files: data.files }); },
	                    error: error
	                });
	                break;
	            default:
	                error("Unknown cmd " + msg.cmd);
	                break;
	        }
	    }
	    catch (e) {
	        console.log("Streaming Worker ERROR!", e);
	    }
	};
	var BinaryAudioStreamingProcessor = (function () {
	    function BinaryAudioStreamingProcessor(cfg) {
	        var _this = this;
	        this.cfg = cfg;
	        this.connected = false;
	        this.socket = null;
	        this.Finish = function (cfg) {
	            cfg = cfg || {};
	            if (!!this.socket && this.socket.readyState === WebSocket.OPEN) {
	                console.log("Closing stream.");
	                this.socket.send(JSON.stringify({
	                    type: "end"
	                }));
	            }
	            else {
	                this.cfg.error("Can't close stream - connection does not exist.");
	            }
	        };
	        this.numberOfSentBinaryMessages = 0;
	        try {
	            var protocol = cfg.secured ? "wss://" : "ws://";
	            this.url = protocol + cfg.host + ":" + cfg.port + cfg.path;
	            console.log("Trying to connnect to: ", this.url);
	            this.socket = new WebSocket(this.url);
	            this.socket.onopen = function () { return _this.OnOpen(); };
	            this.socket.onerror = function (error) { return _this.Error(error); };
	            this.socket.onmessage = function (response) { return _this.ReceiveData(JSON.parse(response.data)); };
	        }
	        catch (e) {
	            console.log("Error while uploading audio to remote server:", e);
	            this.cfg.error("Can't connect to the audio server.");
	        }
	    }
	    BinaryAudioStreamingProcessor.prototype.OnOpen = function () {
	        console.log("Connection to audio server opened.");
	        this.socket.send(JSON.stringify({
	            type: "start",
	            channels: this.cfg.channels || 1,
	            sampleRate: this.cfg.sampleRate || 44100,
	            bitDepth: this.cfg.bitDepth || 16
	        }));
	        this.connected = true;
	        this.cfg.opened();
	    };
	    BinaryAudioStreamingProcessor.prototype.Error = function (error) {
	        console.log("Connection error: ", error);
	        this.cfg.error("Connection error: " + error.toString());
	    };
	    BinaryAudioStreamingProcessor.prototype.PushData = function (data) {
	        if (this.socket) {
	            if (this.socket.readyState !== WebSocket.OPEN) {
	                this.Error("Connection was lost");
	                this.socket = null;
	                return false;
	            }
	            else {
	                this.socket.send(this.ConvertTo16BitInt(data).buffer);
	                return true;
	            }
	        }
	        else {
	            return false;
	        }
	    };
	    BinaryAudioStreamingProcessor.prototype.ConvertTo16BitInt = function (buffer) {
	        var tmp = new Int16Array(buffer.length);
	        for (var i = 0; i < buffer.length; i++) {
	            tmp[i] = Math.min(1, buffer[i]) * 0x7FFF;
	        }
	        return tmp;
	    };
	    ;
	    BinaryAudioStreamingProcessor.prototype.ReceiveData = function (data) {
	        if (data.error === false) {
	            console.log("Result: SUCCESS - data was written into ", data.files);
	            this.cfg.finished(data.files);
	        }
	        else {
	            this.cfg.error("Error was reported.");
	        }
	    };
	    return BinaryAudioStreamingProcessor;
	})();


/***/ }
/******/ ]);
//# sourceMappingURL=recording-worker.js.map