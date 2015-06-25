/// <reference path="../typings/tsd.d.ts" />
/// <reference path="AudioConvertor" />
var WebSocketServer = require("ws").Server;
var Wav = require("wav");
var fs = require("fs");
var uuid = require("node-uuid");
var colors = require("colors");
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
                console.log(colors.yellow("Audio recorder is running and listening on port " + cfg.port));
            }
            else {
                console.log(colors.red("Audio recorder could not be started."));
            }
            this.server.on("connection", function (socket) { return _this.HandleClient(socket); });
            this.server.on("error", function (error) { return console.log("ERROR: " + error); });
        }
        Server.prototype.HandleClient = function (socket) {
            try {
                // serve the client
                console.log(colors.blue("Handling new client"));
                var fileWriter = null;
                var $this = this;
                // generate random unique file
                var name = this.GetTempFileName(this.cfg.outputDir, ".wav");
                socket.on("message", function (message, flags) {
                    if (!flags.binary) {
                        var msg = JSON.parse(message);
                        if (!!msg && msg.type === "start") {
                            fileWriter = $this.InitRecording(name, msg);
                        }
                        else if (!!msg && msg.type === "end") {
                            $this.FinishRecording(name, fileWriter, socket);
                        }
                        else {
                            // error - unsupported message
                            console.log(colors.red("Unsupported message"), message);
                            socket.close();
                        }
                    }
                    else {
                        if (!!fileWriter) {
                            fileWriter.file.write(message);
                        }
                        else {
                            // error - not initialised properly
                            console.log(colors.red("Binary data can't be accepted - initialisation wasn't done properly."));
                            socket.close();
                        }
                    }
                });
                // stream was closed
                socket.on("close", function () {
                    console.log("stream closed");
                    if (fileWriter !== null) {
                        fileWriter.end();
                    }
                });
            }
            catch (e) {
                console.log(colors.red("A fatal error occured while serving a client. Recording session was aborted."), e);
            }
        };
        Server.prototype.InitRecording = function (name, msg) {
            console.log(colors.gray("initialising streaming into ") + name);
            // save all incoming data (INT16 PCM) to the Wav file
            var fileWriter = new Wav.FileWriter(name, {
                channels: msg.channels || 1,
                sampleRate: msg.sampleRate || 48000,
                bitDepth: msg.bitDepth || 16
            });
            return fileWriter;
        };
        Server.prototype.FinishRecording = function (name, fileWriter, socket) {
            // write the Wav into the file
            fileWriter.end();
            fileWriter = null;
            this.TryConvertTo(name, function (results) {
                // inform the client about the result
                if (!!socket) {
                    socket.send(JSON.stringify({
                        error: false,
                        files: results
                    }));
                }
                else {
                    console.log(colors.red("Can't report the result - socket is already closed"));
                }
                console.log("Results: ", colors.green(results ? results.length : 0));
                console.log(colors.gray("=================================================="));
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
                outputDir: "",
                channels: 1,
                debug: false,
                success: function (files) {
                    var resultFileNames = [{
                            url: input,
                            type: "audio/wav"
                        }];
                    if (files.length > 0) {
                        //                     // I don't need the Wav any more
                        //                     fs.unlink(input, function(err) {
                        //                         if(err) {
                        //                             console.log(colors.red(`Can't delete tmp wav file ${input}`));
                        //                             return;
                        //                         }
                        // 
                        //                         console.log(colors.green(`Tmp file ${input} was deleted`));
                        //                     });
                        resultFileNames = files;
                    }
                    if (success) {
                        success(resultFileNames);
                    }
                },
                error: function () {
                    console.log(colors.red("Error while converting the result from wav to " + this.cfg.formats));
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
var colors = require("colors");
var AudioRecording;
(function (AudioRecording) {
    /**
     * Convert function takes an input file name and converts it to as many
     * destination formats as possible.
     */
    function convert(cfg) {
        if (cfg === undefined) {
            console.log(colors.red("Audio Converted Error - No information passed."));
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
        var debug = cfg.debug === undefined ? true : cfg.debug;
        // Convert the WAV to specified file types and return all the successfuly created ones.
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
                "-loglevel", debug ? "verbose" : "quiet",
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