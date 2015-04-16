// I will need to convert wav to other formats -> run external ffmpeg
var spawn = require("child_process").spawn;

module.exports = {
    convert: function(cfg) {
        if(cfg === undefined) {
            console.log("Audio Converted Error - No information passed.");
            return false;
        }

        if(!cfg.hasOwnProperty("input")) {
            console.log("Audio Converter Error - No input filename specified.");
            return false;
        }

        var input = cfg.input;
        var name = input.substr(0, input.lastIndexOf(".")); // trim the extension
        var outputDir = cfg.outputDir || "./";
        var formats = cfg.formats || [ "mp3" ];
        var done = 0;
        var successful = [];

        // convert the Wav to export files and return file id
        for (var i in formats) {
            var ext = formats[i];
            var output = outputDir + name + "." + ext;
            console.log("Try to convert %s to %s.", input, output);

            var overrideArg = (cfg.hasOwnProperty("override") && cfg.override !== undefined)  ? (cfg.override === true ? "-y" : "-n")
                                                            : "-y"; // override files without asking is the default
            var ffmpeg = spawn("ffmpeg", [
                "-i", input,
                "-ac", cfg.channels || "1", // mono is default
                "-ab", cfg.quality || "64",
                overrideArg,
                output
            ]);
            ffmpeg.on("exit", function(code) {
                console.log("FFmpeg exited with code %s", code);
                if(code === 0) {
                    successful.push(output);
                }

                if(++done === formats.length) {
                    // I'm done
                    if(cfg.hasOwnProperty("success")) {
                        cfg.success(successful);
                    }
                }
            });
            ffmpeg.stderr.on("data", function(err) {
                console.log("FFmpeg err: %s", err);
            });
        }
    }
}