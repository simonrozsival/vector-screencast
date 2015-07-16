/// <reference path="../typings/tsd.d.ts" />
/// <reference path="AudioConvertor" />


var WebSocketServer = require("ws").Server;
var Wav = require("wav");
var fs = require("fs");
var uuid = require("node-uuid");
var colors = require("colors");

module AudioRecording {
	
    export interface IAudio {
        url: string;
        type: string;
    }
    
    export interface IConvertorConfig {
        input: string;
        publicRoot: string;
        outputDir: string;
        formats: Array<string>;
        channels: number;
        override?: boolean;
        quality: number;
        success: (files: Array<IAudio>) => void;
        error: Function;
        debug: boolean;
    }     
    
    export interface IServerConfiguration {
        hostName: string;
        port?: number;
        path?: string;
        outputDir?: string;
        formats?: Array<string>;
        deleteWav?: boolean;
    } 
    
    export class Server {
        
        /** WebSocket server intance */
        private server: any;
                
        constructor(private cfg: IServerConfiguration) {
            // default settings if needed
            if(!cfg.port) cfg.port = 45678;
            if(!cfg.outputDir) cfg.outputDir = __dirname;
            if(!cfg.formats) cfg.formats = [ "mp3", "ogg" ];
            
            // init binary server
            this.server = new WebSocketServer({
                port: cfg.port
            });            
            
            if(this.server) {
                console.log(colors.yellow(`Audio recorder is running and listening on port ${cfg.port}`));
            } else {
                console.log(colors.red("Audio recorder could not be started."));
            }
            
            this.server.on("connection", (socket) => this.HandleClient(socket));
            this.server.on("error", (error) => console.log(`ERROR: ${error}`));
        }

        private HandleClient(socket: any) : void {
            try {
                // serve the client
                console.log(colors.blue("Handling new client"));
                var fileWriter: any = null;
                var $this: Server = this;
                
                // generate random unique file
                var name: string = this.GetTempFileName(this.cfg.outputDir, ".wav");   
                var recordingEndedProperly: boolean = false;
                var receivedBinaryMessages: number = 0;
        
                socket.on("message", (message, flags) => {                
                    if(!flags.binary) {
                        var msg: any = JSON.parse(message);
                        if (!!msg && msg.type === "start") {
                            console.log("START message received.");
                            fileWriter = this.InitRecording(name, msg);                        
                        } else if (!!msg && msg.type === "end") {
                            console.log("Finished receiving binary messages. Total of messages: ", receivedBinaryMessages);
                            console.log("END message received.");
                            recordingEndedProperly = true;
                            this.FinishRecording(this.cfg.hostName, name, fileWriter, socket, this.cfg.deleteWav);
                        } else {
                            // error - unsupported message
                            console.log(colors.red("Unsupported message"), message);                        
                            socket.close();
                        }                        
                    } else {
                        if(!!fileWriter) {
                            receivedBinaryMessages++;
                            fileWriter.file.write(message);
                        } else {
                            // error - not initialised properly
                            console.log(colors.red("Binary data can't be accepted - initialisation wasn't done properly."));
                            socket.close();
                        }
                    }
                }); 
        
                // stream was closed
                socket.on("close", () => {
                    console.log("stream closed");
                    if(!recordingEndedProperly) {
                        if(fileWriter !== null) {
                            fileWriter.end();
                            fs.unlink(name, (err) => {
                                if(err) {
                                    console.log(colors.red(`Can't delete tmp wav file ${name}`));
                                    return;
                                }
        
                                console.log(colors.yellow(`Tmp file ${name} was deleted as stream was closed and not ended properly`));
                            });
                        }                        
                    }
                });
            } catch (e) {
                console.log(colors.red("A fatal error occured while serving a client. Recording session was aborted."), e);   
            }            
        }

        private InitRecording(name: string, msg: any) : any  {
            console.log(colors.gray("initialising streaming into ") + name);        
            // save all incoming data (INT16 PCM) to the Wav file
            var fileWriter = new Wav.FileWriter(name, {
                channels: msg.channels || 1,
                sampleRate: msg.sampleRate || 48000,
                bitDepth: msg.bitDepth || 16
            });
                        
            return fileWriter;
        }
                
        private FinishRecording(hostName: string, name: string, fileWriter: any, socket: any, deleteWav: boolean): void {
            // write the Wav into the file
            fileWriter.end();
            fileWriter = null;
    
            this.TryConvertTo(name, deleteWav, function(results) {
                // inform the client about the result
                if(!!socket) {
                    for (var i = 0; i < results.length; i++) {
                        results[i].url = hostName + results[i].url;                        
                    }
                    
                    socket.send(JSON.stringify({
                        error: false,
                        files: results
                    }));
                } else {
                    console.log(colors.red("Can't report the result - socket is already closed"));
                }
                
                 // now close the socket
                socket.close(); 
            });
        }

        private GetTempFileName(dir: string, ext: string) : string {
            dir = dir || "./";
            ext = ext || "";
    
            // this will NEVER colide, for sure
            // see http://en.wikipedia.org/wiki/Universally_unique_identifier
            return `${dir}/${uuid.v4()}${ext}`;
        }
    
        private TryConvertTo(input: string, deleteWav: boolean, success: (files: Array<IAudio>) => void) {
            convert({
                input: input,
                formats: this.cfg.formats,
                quality: 64,
                publicRoot: "./public",
                outputDir: "/recordings",
                channels: 1, // always 1 channel
                debug: false,
                success: function(files: Array<IAudio>) {
                    var resultFileNames: Array<IAudio> = [{
                            url:    input,
                            type:   "audio/wav"
                        }];
                    if(files.length > 0) {
                        if(deleteWav) {
                            // I don't need the Wav any more
                            fs.unlink(input, function(err) {
                                if(err) {
                                    console.log(colors.red(`Can't delete tmp wav file ${input}`));
                                    return;
                                }
        
                                console.log(colors.green(`Tmp file ${input} was deleted`));
                            });                            
                            resultFileNames = files;
                        } else {
                            resultFileNames = resultFileNames.concat(files);   
                        }    
                    }
    
                    if(success) {
                        success(resultFileNames);
                    }
                },
                error: function() {
                    console.log(colors.red(`Error while converting the result from wav to ${this.cfg.formats}`));
                }
            })
        }   
    }
    
}


module.exports = AudioRecording.Server;