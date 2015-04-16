/**
 *
 * This script is used only by Web Workers.
 *
 */

var window = { }; // fake window for BinaryJS (it doesn't know it runs inside a web worker)
importScripts("/js/libs/binary.min.js");
//importScripts("http://cdn.binaryjs.com/0/binary.js");

/**
 *
 * @class
 */
var BinaryJSStreamingAudioProcessor = (function() {

    /** bool */
    var connected = false;

    /** object BinaryClient */
    var client = null;

    /** object WebSocket Stream */
    var uploadStream = null;

    /**
     * Creates a WebSocket and tries to connect.
     * @param cfg
     * @constructor
     */
    function BinaryJSStreamingAudioProcessor(cfg) {
        cfg = cfg || {};
        if(BinaryClient == undefined) {
            // error
            if(cfg.hasOwnProperty("error")) {
                cfg.error({
                    code: 404,
                    message: "BinaryClient is not loaded."
                });
            }
        } else {
            // the socket is a WebSocket - protocol "ws://" - "wss://" is secured
            var protocol = cfg.secured ? "wss://" : "ws://";
            var url = protocol + cfg.host + ":" + cfg.port + cfg.path;
            console.log("Try connecting to: ", url);

            // this script uses BinaryJS library
            // see https://binaryjs.com/
            client = new BinaryClient(url);
            client.on("open", function() {
                console.log("Connection to audio server opened.");
                // success
                uploadStream = client.createStream({
                    channels: cfg.channels || 1,
                    sampleRate: cfg.sampleRate || 44100,
                    bitDepth: cfg.bitDepth || 16
                });
                connected = true;
                if(cfg.hasOwnProperty("success")) {
                    cfg.success();
                }
            });

            client.on("error", function(error) {
                console.log("Connection error: ", error);
                if(cfg.hasOwnProperty("error")) {
                    cfg.error({
                        code: 0, // @todo code
                        message: "reason" // reason
                    })
                }
            });
        }
    }

    BinaryJSStreamingAudioProcessor.prototype.pushData = function (data) {
        if(uploadStream) {
            if(!uploadStream.writable) {
                error("Connection was lost");
                uploadStream = null;
            } else {
                var buffer = convertTo16BitInt(data);
                uploadStream.write(buffer);
            }
        }
    };

    var convertTo16BitInt = function (buffer) {
        var tmp = new Int16Array(buffer.length);
        for (var i = 0; i < buffer.length; i++) {
            tmp[i] = Math.min(1, buffer[i]) * 0x7FFF; // @todo explain this magic in comments
        }
        return tmp;
    };

    BinaryJSStreamingAudioProcessor.prototype.finish = function(cfg) {
        cfg = cfg || {};
        if(uploadStream) {
            // close the stream and wait for response
            uploadStream.on("data", function(data) {
                if(data.error === false) {
                    // success
                    console.log("Result: SUCCESS - data was written into ", data.fileName);
                    if(cfg.hasOwnProperty("success")) {
                        cfg.success({
                            fileName: data.fileName
                        });
                    }
                } else {
                    if(cfg.hasOwnProperty("error")) {
                        cfg.error({
                            code: 0, // @todo
                            message: "Error was reported."
                        });
                    }
                }
            });

            console.log("Closing stream.");
            uploadStream.end();
        } else {
            if(cfg.hasOwnProperty("error")) {
                cfg.error({
                    code: 0, // @todo
                    message: "Can't close stream - connection does not exist."
                });
            }
        }
    };

    return BinaryJSStreamingAudioProcessor;

})();