
import { Message } from './common';

// communication protocol between the browser and this worker
var CMD_INIT = "init";
var CMD_PUSH_DATA = "pushData";
var CMD_FINISH = "finish";

/**
 * Report error to the user.
 * @param {String} msg
 */
function err(msg: string) : void {
    console.log("Recording Worker error: " + msg);
    this.postMessage({ type: "error", msg: msg }); // report error
}

/** The audio processing object */
var audioProcessor: any = null;

/**
 * Worker entry point.
 * @param {object}  Message object
 */
this.onmessage = function(e: Message) {
    var msg = e.data;
    if(!msg.hasOwnProperty("cmd")) {
        console.log("Recording Worker error: message does not contain 'cmd' property.");
    }

    switch(msg.cmd) {
        // start new upload
        case CMD_INIT:
            audioProcessor = new AudioFileBuffer(msg.url, msg.sampleRate);
            break;
            
        // next block of data is available
        case CMD_PUSH_DATA:
            audioProcessor.PushData(msg.data);
            break;
            
        // user stopped the recording
        case CMD_FINISH:
            audioProcessor.Finish({
                success: (data: any) => this.postMessage({ error: false, files: data.files }),
                error: err
            });
            break;
            
        // ?? - error
        default:
            err("Unknown cmd " + msg.cmd);
            break;
    }
};


/**
 * This class enables communication over WebSockets using BinaryJS library.
 */
class AudioFileBuffer {
    
	/** Buffered data arrays */
	private data: Array<Int16Array>;
	
    /**
     * Creates a WebSocket and tries to connect.
	 * @param	url		Upload url.
     */
    constructor(private url: string, private sampleRate: number) { }

    /**
     * Send data to the remote server.
     * It is necessary to encode the data into 16-bit integers, so the other side can work with them properly. 
     */
    public PushData(buffer: Float32Array): void {
        this.data.push(this.ConvertTo16BitInt(buffer));
    }

    /**
     * Input value is in the range of [-1; 1]
     * - I need to convert it to 16 bit integer to be able to save it as WAV later.
     * Magic explained: 0x7FFF == 32767 == (2^15 - 1) is the maximum positive value of a 16-bit integer
     */
    private ConvertTo16BitInt (buffer: Float32Array) : Int16Array {
        var tmp = new Int16Array(buffer.length);
        for (var i = 0; i < buffer.length; i++) {
            tmp[i] = Math.min(1, buffer[i]) * 0x7FFF;
        }
        return tmp;
    };

    /**
     * Stop recording.
     */
    public Finish(cfg: any): any {
        // export WAV blob		
		return null;
    }
	
	/**
	 * Create a WAV Blob from the recorded data.  
	 */
	private exportWav(): Blob {
		return null;
	}	
}