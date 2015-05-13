/**
 * Created by rozsival on 12/04/15.
 */

importScripts("binaryjs-streaming-audio-processor.js");

var audioProcessor = null;
var CMD_INIT = "init";
var CMD_PUSH_DATA = "pushData";
var CMD_FINISH = "finish";
var supportedRecordingProcessors = {
    "web-socket": BinaryJSStreamingAudioProcessor
};

/**
 * Worker entry point.
 * @param {object} msg
 */
this.onmessage = function(e) {
    var msg = e.data;
    if(!msg.hasOwnProperty("cmd")) {
        console.log("Recording Worker error: message does not contain 'cmd' property.");
    }

    switch(msg.cmd) {
        case CMD_INIT:
            var AudioProcessorType = supportedRecordingProcessors.hasOwnProperty(msg.AudioProcessorType)
                ? supportedRecordingProcessors[msg.AudioProcessorType] : null;

            if(AudioProcessorType === null) {
                error("Unknown Audio processor type ", AudioProcessorType);
                return;
            }

            audioProcessor = new AudioProcessorType({
                host: msg.host,
                port: msg.port,
                path: msg.path,
                success: function () {
                    postMessage({
                        error: false,
                        msg: "init successful"
                    });
                },
                error: function() {
                    error("Can't init audio processor");
                }
            });
            break;
        case CMD_PUSH_DATA:
            audioProcessor.pushData(msg.data);
            break;
        case CMD_FINISH:
            audioProcessor.finish({
                success: function(data) {
                    postMessage({
                        error: false,
                        files: data.files
                    });
                },
                error: function(data) {
                    error(data.message);
                }
            });
            break;
        default:
            error("Unknown cmd " + msg.cmd);
    }
};

/**
 * Report error to the user.
 * @param {String} msg
 */
function error(msg) {
    console.log("Recording Worker error: " + msg);
    postMessage({
        error: true,
        msg: msg
    });
}