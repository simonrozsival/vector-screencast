//
// AUDIO UPLOAD
//

var uploadServer = require("./audio-server/audio-server");
var port = process.argv.length > 2 ? parseInt(process.argv[2]) : 4000;
uploadServer({
    port: port,
    path: "/upload/audio",
    outputDir: "./recordings",
    format: [ "mp3", "ogg" ]
});