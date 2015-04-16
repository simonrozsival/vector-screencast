/**
 *
 * @param {object} cfg
 * @module
 */
module.exports = function(cfg) {

    //
    // INIT
    //
    var BinaryServer = require("binaryjs").BinaryServer;
    var Wav = require("wav");
    var fs = require("fs");
    var uuid = require("node-uuid");
    var convertor = require("./audio-convert");

    var port = cfg.port || 45678;
    var server = new BinaryServer({
        port: port,
        path: cfg.path || "/"
    });
    var outputDir = cfg.outputDir || "./";

    // an array of output formats
    var formats = cfg.formats || [ "mp3", "ogg" ];
    if(!Array.isArray(formats)) {
        formats = [ formats ];
    }

    if(server) {
        console.log("Audio recorder is running and listening on port " + port);
    } else {
        console.log("Audio recorder could not be started.");
    }


    //
    // Wait for connections
    //

    server.on("connection", function(client) {

        // serve the client
        console.log("new client");
        var fileWriter = null;

        client.on("stream", function(stream, meta) {
            // generate random unique file
            var name = getTempFileName(outputDir, ".wav");
            console.log("streaming into " + name);

            // save all incoming data (INT16 PCM) to the Wav file
            fileWriter = new Wav.FileWriter(name, {
                channels: meta.channels || 1,
                sampleRate: meta.sampleRate || 48000,
                bitDepth: meta.bitDepth || 16
            });
            stream.pipe(fileWriter);


            stream.on("end", function() {
                // write the Wav into the file
                fileWriter.end();
                fileWriter = null;

                tryConvertTo(name, formats, function(resultFileName) {
                    // inform the client about the result
                    stream.write({
                        error: false,
                        fileName: resultFileName
                    });
                    console.log("result: ", resultFileName);
                });
            });
        });

        // stream was closed
        client.on("close", function() {
            console.log("stream closed");
            if(fileWriter !== null) {
                fileWriter.end();
            }
        });
    });

    server.on("error", function(error) {
        console.log("ERROR: " + error);
    });

    function getTempFileName(dir, ext) {
        dir = dir || "./";
        ext = ext || "";

        // this will NEVER colide, for sure
        // see http://en.wikipedia.org/wiki/Universally_unique_identifier
        return dir + "/" + uuid.v4() + ext;
    }

    function tryConvertTo(input, formats, success) {
        convertor.convert({
            input: input,
            formats: formats,
            quality: "64",

            success: function(files) {
                var resultFileNames = [ input ];
                if(files.length > 0) {
                    // I don't need the Wav any more
                    fs.unlink(input, function(err) {
                        if(err) {
                            console.log("Can't delete tmp wav file %s", input);
                            return;
                        }

                        console.log("Tmp file %s was deleted", input);
                    });

                    resultFileNames = files;
                }

                if(success) {
                    success(resultFileNames);
                }
            },

            error: function() {
                console.log("Error while converting the result from wav to %s.", formats);
            }
        })
    }

};