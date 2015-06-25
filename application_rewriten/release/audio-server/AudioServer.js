/// <reference path="../typings/tsd.d.ts" />
/// <reference path="AudioConvertor" />
var WebSocketServer = require("ws").Server;
var Wav = require("wav");
var fs = require("fs");
var uuid = require("node-uuid");
var StreamBuffers = require("stream-buffers");
var AudioRecording;
(function (AudioRecording) {
    var Server = (function () {
        function Server(cfg) {
            var _this = this;
            this.cfg = cfg;
            // default settings if needed
            if (!cfg.port)
                cfg.port = 45678;
            if (!cfg.outputDir)
                cfg.outputDir = __dirname;
            if (!cfg.formats)
                cfg.formats = ["mp3", "ogg"];
            // init binary server
            this.server = new WebSocketServer({
                port: cfg.port
            });
            if (this.server) {
                console.log("Audio recorder is running and listening on port " + cfg.port);
            }
            else {
                console.log("Audio recorder could not be started.");
            }
            this.server.on("connection", function (socket) { return _this.HandleClient(socket); });
            this.server.on("error", function (error) { return console.log("ERROR: " + error); });
        }
        Server.prototype.HandleClient = function (socket) {
            // serve the client
            console.log("new client");
            var fileWriter = null;
            var stream = null;
            var $this = this;
            socket.on("message", function (message, flags) {
                if (!flags.binary) {
                    var msg = JSON.parse(message);
                    if (!!msg && msg.type === "start") {
                        fileWriter = $this.InitRecording(msg);
                        stream = $this.CreateStream(fileWriter);
                    }
                    else if (!!msg && msg.type === "end") {
                        $this.FinishRecording(fileWriter, socket);
                    }
                    else {
                        // error - unsupported message
                        console.log("Unsupported message", message);
                        socket.close();
                    }
                }
                else {
                    if (!!stream) {
                        console.log(message);
                        stream.write(message);
                    }
                    else {
                        // error - not initialised properly
                        console.log("Binary data can't be accepted - initialisation wasn't done properly.");
                        socket.close();
                    }
                }
                // run the 
                stream.on("end", function () {
                    $this.FinishRecording(fileWriter, stream);
                });
            });
            // stream was closed
            socket.on("close", function () {
                console.log("stream closed");
                if (fileWriter !== null) {
                    fileWriter.end();
                }
            });
        };
        Server.prototype.InitRecording = function (msg) {
            // generate random unique file
            var name = this.GetTempFileName(this.cfg.outputDir, ".wav");
            console.log("streaming into " + name);
            // save all incoming data (INT16 PCM) to the Wav file
            var fileWriter = new Wav.FileWriter(name, {
                channels: msg.channels || 1,
                sampleRate: msg.sampleRate || 48000,
                bitDepth: msg.bitDepth || 16
            });
            return fileWriter;
        };
        Server.prototype.CreateStream = function (fileWriter) {
            var stream = new StreamBuffers();
            stream.pipe(fileWriter);
            return stream;
        };
        Server.prototype.FinishRecording = function (fileWriter, socket) {
            // write the Wav into the file
            fileWriter.end();
            fileWriter = null;
            this.TryConvertTo(name, function (results) {
                // inform the client about the result
                socket.write(JSON.stringify({
                    error: false,
                    files: results
                }));
                console.log("result: ", results);
            });
        };
        Server.prototype.GetTempFileName = function (dir, ext) {
            dir = dir || "./";
            ext = ext || "";
            // this will NEVER colide, for sure
            // see http://en.wikipedia.org/wiki/Universally_unique_identifier
            return dir + "/" + uuid.v4() + ext;
        };
        Server.prototype.TryConvertTo = function (input, success) {
            AudioRecording.convert({
                input: input,
                formats: this.cfg.formats,
                quality: 64,
                outputDir: this.cfg.outputDir,
                channels: 1,
                success: function (files) {
                    var resultFileNames = [{
                            url: input,
                            type: "audio/wav"
                        }];
                    if (files.length > 0) {
                        // I don't need the Wav any more
                        fs.unlink(input, function (err) {
                            if (err) {
                                console.log("Can't delete tmp wav file %s", input);
                                return;
                            }
                            console.log("Tmp file %s was deleted", input);
                        });
                        resultFileNames = files;
                    }
                    if (success) {
                        success(resultFileNames);
                    }
                },
                error: function () {
                    console.log("Error while converting the result from wav to %s.", this.cfg.formats);
                }
            });
        };
        return Server;
    })();
    AudioRecording.Server = Server;
})(AudioRecording || (AudioRecording = {}));
module.exports = AudioRecording.Server;
/// <refenrece path="../typings/tsd.d.ts" />
/// <reference path="AudioRecording" />
// I will need to convert wav to other formats -> use ffmpeg
var spawn = require("child_process").spawn;
var AudioRecording;
(function (AudioRecording) {
    /**
     * Convert function takes an input file name and converts it to as many
     * destination formats as possible.
     */
    function convert(cfg) {
        if (cfg === undefined) {
            console.log("Audio Converted Error - No information passed.");
            return false;
        }
        if (!cfg.hasOwnProperty("input")) {
            console.log("Audio Converter Error - No input filename specified.");
            return false;
        }
        // prepare the process
        var input = cfg.input;
        var name = input.substr(0, input.lastIndexOf(".")); // trim the extension
        var outputDir = cfg.outputDir || "./";
        var formats = cfg.formats || ["mp3"];
        var done = 0;
        var successful = [];
        // Convert the WAV to specified file types and return all the successfuly created ones.
        // Also delete the huge WAV if at least one compressed file was created. 
        for (var i in formats) {
            var ext = formats[i];
            var output = outputDir + name + "." + ext;
            console.log("Trying to convert %s to %s.", input, output);
            var overrideArg = (cfg.hasOwnProperty("override") && cfg.override !== undefined) ? (cfg.override === true ? "-y" : "-n")
                : "-y"; // override files without asking is the default            
            var ffmpeg = spawn("ffmpeg", [
                "-i", input,
                "-ac", cfg.channels || "1",
                "-ab", cfg.quality || "64",
                overrideArg,
                output
            ]);
            ffmpeg.on("exit", function (code) {
                console.log("FFmpeg exited with code %s", code);
                if (code === 0) {
                    successful.push({
                        url: output,
                        type: "audio/" + ext
                    });
                }
                if (++done === formats.length) {
                    // I'm done - all files have aleready been done
                    if (cfg.hasOwnProperty("success")) {
                        cfg.success(successful);
                    }
                }
            });
            // define what to do, if something goes wrong
            ffmpeg.stderr.on("data", function (err) {
                console.log("FFmpeg err: %s", err);
            });
        }
    }
    AudioRecording.convert = convert;
})(AudioRecording || (AudioRecording = {}));
//# sourceMappingURL=AudioServer.js.map