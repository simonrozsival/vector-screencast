var CMD_INIT = "init";
var CMD_PUSH_DATA = "pushData";
var CMD_FINISH = "finish";
function err(msg) {
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
    switch (msg.cmd) {
        case CMD_INIT:
            audioProcessor = new AudioFileBuffer(msg.url, msg.sampleRate);
            break;
        case CMD_PUSH_DATA:
            audioProcessor.PushData(msg.data);
            break;
        case CMD_FINISH:
            audioProcessor.Finish({
                success: function (data) { return _this.postMessage({ error: false, files: data.files }); },
                error: err
            });
            break;
        default:
            err("Unknown cmd " + msg.cmd);
            break;
    }
};
var AudioFileBuffer = (function () {
    function AudioFileBuffer(url, sampleRate) {
        this.url = url;
        this.sampleRate = sampleRate;
    }
    AudioFileBuffer.prototype.PushData = function (buffer) {
        this.data.push(this.ConvertTo16BitInt(buffer));
    };
    AudioFileBuffer.prototype.ConvertTo16BitInt = function (buffer) {
        var tmp = new Int16Array(buffer.length);
        for (var i = 0; i < buffer.length; i++) {
            tmp[i] = Math.min(1, buffer[i]) * 0x7FFF;
        }
        return tmp;
    };
    ;
    AudioFileBuffer.prototype.Finish = function (cfg) {
        return null;
    };
    AudioFileBuffer.prototype.exportWav = function () {
        return null;
    };
    return AudioFileBuffer;
})();
//# sourceMappingURL=BufferingRecordingWorker.js.map