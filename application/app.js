/**
 * Application serving the whole page.
 */


//
// INIT
var express = require("express");
var port = process.argv.length > 2 ? parseInt(process.argv[2]) : 3000; // first argument (optional) is the port
var app = express();
var expressHandlebars = require("express-handlebars");
var fs = require("fs");

app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//
// Middleware
//

// gzip/deflate outgoing responses
var compression = require('compression');
app.use(compression())

// serve static files like .css and .js
app.use(express.static("public", {
    extensions: [ "css", "js", "html" ]
}));

var bodyParser = require('body-parser')
app.use(bodyParser.json({
    limit: "100mb"
}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: "100mb",
    extended: true
}));

//
// Configure the serever - ROUTING
//

app.get("/", function(req, res) {
    res.render("homepage", {
        recordings: [
            {
                id:             1,
                title:          "Video",
                author:         "Šimon",
                description:    "Description of the video."
            }
        ]
    })
});


app.get("/record", function(req, res) {
    res.render("record", {
        title: "Record new video"
    });
});

app.get("/play/:id", function(req, res) {
    console.log("Play video " + req.params.id);
    res.render("play", {
        title: "Play video '" + "Video" + "'",
        id: req.params.id,
        recording: {
            id:             req.params.id,
            title:          "Video",
            author:         "Šimon",
            description:    "Description of the video."
        }
    });
});

app.post("/upload/result", function(req, res) {
    console.log("\nIncomming result:");
    // @todo save the data to the FS and DB
    console.log(req.body);

    // done
    console.log("Finished uploading");
    res.json({
        success: true,
        redirect: "/play/1"
    });
});


//
// RUN THE SERVER
//

var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("App server is running at http://%s:%s", host, port);
});
