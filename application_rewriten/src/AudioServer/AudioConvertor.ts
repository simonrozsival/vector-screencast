/// <refenrece path="../typings/tsd.d.ts" />
/// <reference path="AudioRecording" />

// I will need to convert wav to other formats -> use ffmpeg
var spawn = require("child_process").spawn;
var colors = require("colors");


module AudioRecording {
        
    /**
     * Convert function takes an input file name and converts it to as many 
     * destination formats as possible.     
     */
    export function convert(cfg: IConvertorConfig) {
        if(cfg === undefined) {
            console.log(colors.red("Audio Converted Error - No information passed."));
            return false;
        }

        if(!cfg.hasOwnProperty("input")) {
            console.log("Audio Converter Error - No input filename specified.");
            return false;
        }

        // prepare the process
        var input = cfg.input;
        var name = input.substr(0, input.lastIndexOf(".")); // trim the extension
        var outputDir = cfg.outputDir || "./";
        var formats = cfg.formats || [ "mp3" ];
        var done = 0;
        var successful: Array<IAudio> = [];
        var debug: boolean = cfg.debug === undefined ? true : cfg.debug;

        // Convert the WAV to specified file types and return all the successfuly created ones.
        for (var i in formats) {
            var ext = formats[i];
            var output = outputDir + name + "." + ext;
            console.log("Trying to convert %s to %s.", input, output);

            var overrideArg = (cfg.hasOwnProperty("override") && cfg.override !== undefined)  ? (cfg.override === true ? "-y" : "-n")
                                                            : "-y"; // override files without asking is the default            
            var ffmpeg = spawn("ffmpeg", [
                "-i", input,
                "-ac", cfg.channels || "1", // mono is default
                "-ab", cfg.quality || "64",
                "-loglevel", debug ? "verbose" : "quiet",
                overrideArg,
                output
            ]);
                        
            ffmpeg.on("exit", function(code) {
                console.log("FFmpeg exited with code %s", code);
                if(code === 0) {
                    successful.push({
                        url:    output,
                        type:   "audio/" + ext   
                    });
                }

                if(++done === formats.length) {
                    // I'm done - all files have aleready been done
                    if(cfg.hasOwnProperty("success")) {
                        cfg.success(successful);
                    }
                }
            });
            
            // define what to do, if something goes wrong
            ffmpeg.stderr.on("data", function(err) {
                console.log("FFmpeg err: %s", err);
            });
        }
    }
}