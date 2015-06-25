// communication protocol between the browser and this worker
var CMD_INIT = "init";
var CMD_PUSH_DATA = "pushData";
var CMD_FINISH = "finish";
/**
 * Report error to the user.
 * @param {String} msg
 */
function error(msg) {
    console.log("Recording Worker error: " + msg);
    this.postMessage({ error: true, msg: msg }); // report error
}
/** The audio processing object */
var audioProcessor = null;
/**
 * Worker entry point.
 * @param {object}  Message object
 */
this.onmessage = function (e) {
    var _this = this;
    var msg = e.data;
    if (!msg.hasOwnProperty("cmd")) {
        console.log("Recording Worker error: message does not contain 'cmd' property.");
    }
    switch (msg.cmd) {
        // start new upload
        case CMD_INIT:
            audioProcessor = new BinaryAudioStreamingProcessor({
                host: msg.host,
                port: msg.port,
                path: msg.path,
                secured: false,
                opened: function () { return console.log("Streaming was initialised successfully."); },
                finished: function (files) { return _this.postMessage({ error: false, files: files }); },
                error: function () { return error("Can't init audio processor"); }
            });
            break;
        // next block of data is available
        case CMD_PUSH_DATA:
            audioProcessor.PushData(msg.data);
            break;
        // user stopped the recording
        case CMD_FINISH:
            audioProcessor.Finish({
                success: function (data) { return _this.postMessage({ error: false, files: data.files }); },
                error: error
            });
            break;
        // ?? - error
        default:
            error("Unknown cmd " + msg.cmd);
            break;
    }
};
/**
 * This class enables communication over WebSockets using BinaryJS library.
 */
var BinaryAudioStreamingProcessor = (function () {
    /**
     * Creates a WebSocket and tries to connect.
     */
    function BinaryAudioStreamingProcessor(cfg) {
        var _this = this;
        this.cfg = cfg;
        this.connected = false;
        this.socket = null;
        /**
         * Stop recording.
         */
        this.Finish = function (cfg) {
            cfg = cfg || {};
            if (!!this.socket && this.socket.readyState === WebSocket.OPEN) {
                // prepare the reaction - close the stream and wait for response
                console.log("Closing stream.");
                this.socket.send(JSON.stringify({
                    type: "end"
                }));
            }
            else {
                this.cfg.error("Can't close stream - connection does not exist.");
            }
        };
        try {
            // the socket is a WebSocket - protocol "ws://" - "wss://" is secured
            var protocol = cfg.secured ? "wss://" : "ws://";
            this.url = protocol + cfg.host + ":" + cfg.port + cfg.path;
            console.log("Trying to connnect to: ", this.url);
            // this script uses BinaryJS library
            // see https://binaryjs.com/
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
    /**
     * Create the upload stream as soon as we are connected to the remote server.
     */
    BinaryAudioStreamingProcessor.prototype.OnOpen = function () {
        console.log("Connection to audio server opened.");
        // success
        this.socket.send(JSON.stringify({
            type: "start",
            channels: this.cfg.channels || 1,
            sampleRate: this.cfg.sampleRate || 44100,
            bitDepth: this.cfg.bitDepth || 16
        }));
        this.connected = true;
        this.cfg.opened();
    };
    /**
     * Handle connection error
     */
    BinaryAudioStreamingProcessor.prototype.Error = function (error) {
        console.log("Connection error: ", error);
        this.cfg.error("Connection error: " + error.toString());
    };
    /**
     * Send data to the remote server.
     * It is necessary to encode the data into 16-bit integers, so the other side can work with them properly.
     */
    BinaryAudioStreamingProcessor.prototype.PushData = function (data) {
        if (this.socket) {
            if (this.socket.readyState !== WebSocket.OPEN) {
                this.Error("Connection was lost");
                this.socket = null;
            }
            else {
                this.socket.send(this.ConvertTo16BitInt(data).buffer);
            }
        }
    };
    /**
     * Input value is in the range of [-1; 1]
     * - I need to convert it to 16 bit integer to be able to save it as WAV later.
     * Magic explained: 0x7FFF == 32767 == (2^15 - 1) is the maximum positive value of a 16-bit integer
     */
    BinaryAudioStreamingProcessor.prototype.ConvertTo16BitInt = function (buffer) {
        var tmp = new Int16Array(buffer.length);
        for (var i = 0; i < buffer.length; i++) {
            tmp[i] = Math.min(1, buffer[i]) * 0x7FFF;
        }
        return tmp;
    };
    ;
    /**
     * A JSON response from the remote server.
     * If upload went well, the server has converted the file into some advanced audio format, like mp3,
     * and it sends a list of files it had created on the server.
     */
    BinaryAudioStreamingProcessor.prototype.ReceiveData = function (data) {
        if (data.error === false) {
            // success
            console.log("Result: SUCCESS - data was written into ", data.files);
            this.cfg.finished(data.files);
        }
        else {
            this.cfg.error("Error was reported.");
        }
    };
    return BinaryAudioStreamingProcessor;
})();
//# sourceMappingURL=RecordingWorker.js.map