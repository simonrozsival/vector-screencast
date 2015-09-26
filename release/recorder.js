webpackJsonp([1],[function(t,e,n){"use strict";var r=n(24),o=n(28),i=n(29),s=n(13),a=n(9),u=n(10),c=n(26),h=n(8),l=n(1),d=n(18),p=n(21),f=n(33),g=n(7),y=n(20),m=n(15),v=n(25),C=function(){function t(t,e){var n=this;this.id=t,this.settings=e,this.events=new l["default"],this.isRecording=!1,this.timer=new d["default"](!1),this.recordingBlocked=!1,this.data=new r["default"],this.lastEraseData=0,this.recordAllRawData=void 0!==e.RecordAllRawData?!!e.RecordAllRawData:!0,e.DefaultBackgroundColor&&(g["default"].BackgroundColor=e.DefaultBackgroundColor),e.DefaultBrushColor&&(g["default"].ForegroundColor=e.DefaultBrushColor);var p=document.getElementById(t);if(!p)return void h["default"].Report(h.ErrorType.Fatal,"Container #"+t+" doesn't exist. Video Recorder couldn't be initialised.");for(;p.firstChild;)p.removeChild(p.firstChild);if(!e.ColorPallete||0===e.ColorPallete.length){var m=[];m.push(new g["default"]("#ffffff")),m.push(new g["default"]("#fa5959")),m.push(new g["default"]("#8cfa59")),m.push(new g["default"]("#59a0fa")),m.push(new g["default"]("#fbff06")),m.push(g["default"].BackgroundColor),e.ColorPallete=m}if(m.indexOf(g["default"].BackgroundColor)||m.push(g["default"].BackgroundColor),!e.BrushSizes||0===e.BrushSizes.length){var v=[];v.push(new y["default"](2)),v.push(new y["default"](3)),v.push(new y["default"](4)),v.push(new y["default"](6)),v.push(new y["default"](8)),v.push(new y["default"](10)),v.push(new y["default"](15)),v.push(new y["default"](80)),e.BrushSizes=v}if(!e.Localization){var C={NoJS:"Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",Busy:"Preparing recording studio...",RecPause:"Control recording",Record:"Start",Pause:"Pause recording",Upload:"Upload",UploadInProgress:"Uploading data...",ChangeColor:"Change brush color",ChangeSize:"Change brush size",Erase:"Eraser",EraseAll:"Erase everything",WaitingText:"Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window.",UploadWasSuccessful:"Upload was successful",RedirectPrompt:"Upload was successful - press OK to continue",UploadFailure:"Upload failed.",FailureApology:"We are sorry, but upload failed. Do you want to download your data to your computer instead?",AudioRecording:"Audio recording",AudioRecordingAvailable:"Audio recording is available",AudioRecordingUnavailable:"Audio recording is unavailable"};e.Localization=C}this.events.on(l.VideoEventType.ChangeBrushSize,function(t){return n.ChangeBrushSize(t)}),this.events.on(l.VideoEventType.ChangeColor,function(t){return n.ChangeColor(t)}),this.events.on(l.VideoEventType.CursorState,function(t){return n.ProcessCursorState(t)}),this.events.on(l.VideoEventType.ClearCanvas,function(t){return n.ClearCanvas(t)}),this.events.on(l.VideoEventType.Start,function(){return n.Start()}),this.events.on(l.VideoEventType.Pause,function(){return n.Pause()}),this.events.on(l.VideoEventType.StartUpload,function(){return n.StartUpload()}),this.busyLevel=0,this.events.on(l.VideoEventType.Busy,function(){return n.Busy()}),this.events.on(l.VideoEventType.Ready,function(){return n.Ready()}),this.events.on(l.VideoEventType.StartPath,function(t){n.PushChunk(new a.PathChunk(t,n.timer.CurrentTime(),n.lastEraseData)),n.data.CurrentChunk.PushCommand(new u.DrawNextSegment(n.timer.CurrentTime()))}),this.events.on(l.VideoEventType.DrawSegment,function(){return n.data.CurrentChunk.PushCommand(new u.DrawNextSegment(n.timer.CurrentTime()))});var S=v.reduce(function(t,e,n,r){return t.Size<e.Size?t:e}).Size,w=v.reduce(function(t,e,n,r){return t.Size>e.Size?t:e}).Size;this.drawer=e.DrawingStrategy?e.DrawingStrategy:new i["default"](!0),this.drawer.SetEvents(this.events),this.dynaDraw=new o["default"](this.events,function(){return n.drawer.CreatePath(n.events)},!e.DisableDynamicLineWidth,S,w,this.timer),this.ui=e.UI?e.UI:new f["default"](t,this.events),this.ui.Timer=this.timer,this.ui.Localization=e.Localization,this.ui.SetBusyText(e.Localization.Busy),this.ui.CreateHTML(!!e.Autohide,e.ColorPallete,e.BrushSizes);var b=this.drawer.CreateCanvas();this.ui.AcceptCanvas(b),p.appendChild(this.ui.GetHTML()),this.drawer.Stretch(),this.pointer=s["default"].SelectBestMethod(this.events,this.ui.GetHTML(),b,this.timer),e.Audio&&(this.audioRecorder=new c["default"](e.Audio,this.events),this.audioRecorder.Init()),this.ClearCanvas(g["default"].BackgroundColor),this.events.trigger(l.VideoEventType.ChangeColor,g["default"].ForegroundColor),this.events.trigger(l.VideoEventType.ChangeBrushSize,new y["default"](5))}return Object.defineProperty(t.prototype,"Events",{get:function(){return this.events},enumerable:!0,configurable:!0}),t.prototype.Start=function(){this.isRecording===!1&&(this.isRecording=!0,this.PushChunk(new a.VoidChunk(this.timer.CurrentTime(),this.lastEraseData)),this.timer.Resume(),this.audioRecorder&&this.audioRecorder.Start())},t.prototype.Pause=function(){this.isRecording===!0&&(this.isRecording=!1,this.PushChunk(new a.VoidChunk(this.timer.CurrentTime(),this.lastEraseData)),this.timer.Pause(),this.audioRecorder&&this.audioRecorder.Pause())},t.prototype.StartUpload=function(){var t=this;this.recordingBlocked=!0;var e=new p["default"];e.Length=this.timer.CurrentTime(),e.Width=this.ui.Width,e.Height=this.ui.Height,e.AudioTracks=[],this.data.Metadata=e,this.audioRecorder&&this.audioRecorder.isRecording()?this.audioRecorder.Stop(function(e){t.data.Metadata.AudioTracks=e,t.UploadData()},function(){t.FinishRecording(!1)}):this.UploadData()},t.prototype.ChangeBrushSize=function(t){!this.recordingBlocked&&this.data.CurrentChunk.PushCommand(new u.ChangeBrushSize(t,this.timer.CurrentTime())),this.dynaDraw.SetBrushSize(t)},t.prototype.ChangeColor=function(t){!this.recordingBlocked&&this.data.CurrentChunk.PushCommand(new u.ChangeBrushColor(t,this.timer.CurrentTime())),this.drawer.SetCurrentColor(t)},t.prototype.ProcessCursorState=function(t){!this.recordingBlocked&&(this.recordAllRawData||this.isRecording)&&this.data.CurrentChunk.PushCommand(new u.MoveCursor(t.X,t.Y,this.recordAllRawData?t.Pressure:0,this.timer.CurrentTime())),this.dynaDraw.ObserveCursorMovement(t)},t.prototype.ClearCanvas=function(t){var e=this.timer.CurrentTime();this.lastEraseData=this.PushChunk(new a.EraseChunk(t,e,this.lastEraseData)),this.data.CurrentChunk.PushCommand(new u.ClearCanvas(t,e)),this.drawer.ClearCanvas(t)},t.prototype.PushChunk=function(t){return this.data.PushChunk(t)},t.prototype.Busy=function(){this.busyLevel++,this.wasRecordingWhenBusy=this.wasRecordingWhenBusy||this.isRecording,this.events.trigger(l.VideoEventType.Pause),this.ui.Busy()},t.prototype.Ready=function(){0===--this.busyLevel&&(this.wasRecordingWhenBusy===!0&&(this.events.trigger(l.VideoEventType.Start),this.wasRecordingWhenBusy=!1),this.ui.Ready())},t.prototype.UploadData=function(){var t=this,e=this.settings.VideoFormat?this.settings.VideoFormat:new v["default"],n=e.SaveVideo(this.data);console.log(n),this.events.on(l.VideoEventType.DownloadData,function(){m["default"].Download(n,"recorded-animation."+e.GetExtension())}),this.ui.SetBusyText(this.settings.Localization.UploadInProgress),this.events.trigger(l.VideoEventType.Busy);var r=new FormData;r.append("extension",e.GetExtension()),r.append("file",n);var o=new XMLHttpRequest;o.open("POST",this.settings.UploadURL,!0),o.onerror=function(e){return t.FinishRecording(!1)},o.onload=function(e){var n=JSON.parse(o.response);if(200===o.status&&n.hasOwnProperty("success")&&n.success===!0){var r=n.hasOwnProperty("redirect")?n.redirect:!1;t.FinishRecording(!0,r)}else t.FinishRecording(!1)},o.send(r)},t.prototype.FinishRecording=function(t,e){t===!0?(this.ui.SetBusyText(this.settings.Localization.UploadWasSuccessful),"string"==typeof e?confirm(this.settings.Localization.RedirectPrompt)&&window.location.replace(e):alert(this.settings.Localization.UploadWasSuccessful)):(this.ui.SetBusyText(this.settings.Localization.UploadFailure),confirm(this.settings.Localization.FailureApology)&&this.events.trigger(l.VideoEventType.DownloadData))},t}();Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=C},,,,,,,,,,,,,function(t,e,n){"use strict";var r=n(1),o=n(17),i=n(37),s=n(36),a=n(35),u=n(23),c=function(){function t(t,e,n){this.events=t,this.board=e,this.timer=n,this.isHoveringOverUIControl=!1}return t.SelectBestMethod=function(t,e,n,r){var o,c=i["default"].IsAvailable();return null!==c?(o=new i["default"](t,e,r,c),console.log("Wacom WebPAPI is used")):window.hasOwnProperty("PointerEvent")?(o=new s["default"](t,e,r),console.log("Pointer Events API is used")):a["default"].isAvailable()?(o=new a["default"](t,e,n,r),console.log("Apple Force Touch Events over Touch Events API is used")):(o=new u["default"](t,e,n,r),console.log("Touch Events API are used.")),o.InitControlsAvoiding(),o},t.prototype.getCursor=function(){return this.cursor},t.prototype.InitControlsAvoiding=function(){for(var t=this,e=document.getElementsByClassName("ui-control-panel"),n=0;n<e.length;n++){var r=e[n];r.onmouseover=function(e){return t.isHoveringOverUIControl=!0},r.onmouseout=function(e){return t.isHoveringOverUIControl=!1}}},t.prototype.GetPressure=function(){return this.isDown===!0&&this.isInside===!0?1:0},t.prototype.onMove=function(t){this.cursor=this.getCursorPosition(t),this.ReportAction()},t.prototype.onDown=function(t){this.isHoveringOverUIControl===!1&&(this.isDown=!0,this.cursor=this.getCursorPosition(t),this.ReportAction())},t.prototype.onUp=function(t){this.isDown=!1,this.cursor=this.getCursorPosition(t),this.ReportAction()},t.prototype.onLeave=function(t){this.GetPressure()>0&&(this.onMove(t),this.isDown=!1,this.onMove(t),this.isDown=!0),this.isInside=!1},t.prototype.onOver=function(t){this.isInside=!0},t.prototype.onLooseFocus=function(t){this.isInside=!1,this.isDown=!1},t.prototype.getCursorPosition=function(t){return(void 0==t.clientX||void 0==t.clientY)&&console.log("Wrong 'getCursorPosition' parameter. Event data required."),{x:t.clientX,y:t.clientY}},t.prototype.ReportAction=function(){var t=new o.CursorState(this.timer.CurrentTime(),this.cursor.x,this.cursor.y,this.GetPressure());this.events.trigger(r.VideoEventType.CursorState,t)},t}();Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=c},,,,,,,,,function(t,e,n){"use strict";var r=function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},o=n(13),i=function(t){function e(e,n,r){var o=this;t.call(this,e,n,r),this.board.onmousemove=function(t){return o.onMouseMove(t)},this.board.onmousedown=function(t){return o.onMouseDown(t)},this.board.onmouseup=function(t){return o.onMouseUp(t)},this.board.onmouseleave=function(t){return o.onMouseLeave(t)},this.board.onmouseenter=function(t){return o.onMouseEnter(t)},this.board.onmouseover=function(t){return o.onMouseOver(t)}}return r(e,t),e.prototype.InitControlsAvoiding=function(){for(var t=this,e=document.getElementsByClassName("ui-control"),n=0;n<e.length;n++){var r=e[n];r.onmouseover=function(e){return t.isHoveringOverUIControl=!0},r.onmouseout=function(e){return t.isHoveringOverUIControl=!1}}},e.prototype.onMouseMove=function(t){this.onMove(t)},e.prototype.onMouseDown=function(t){this.onDown(t)},e.prototype.onMouseUp=function(t){this.onUp(t)},e.prototype.onMouseLeave=function(t){this.onLeave(t)},e.prototype.onMouseEnter=function(t){0===t.buttons&&(this.isDown=!1)},e.prototype.onMouseOver=function(t){this.isInside=!0},e}(o["default"]);Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=i},function(t,e,n){"use strict";var r=function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},o=n(22),i=function(t){function e(e,n,r,o){var i=this;t.call(this,e,n,o),this.canvas=r,r.addEventListener("touchstart",function(t){return i.TouchStart(t)}),r.addEventListener("touchend",function(t){return i.TouchEnd(t)}),r.addEventListener("touchcancel",function(t){return i.TouchEnd(t)}),r.addEventListener("touchleave",function(t){return i.TouchLeave(t)}),r.addEventListener("touchmove",function(t){return i.TouchMove(t)})}return r(e,t),e.prototype.TouchStart=function(t){t.preventDefault();var e=t.changedTouches,n=e[0];this.currentTouch=n.identifier,this.isInside=!0,this.isHoveringOverUIControl=!1,this.onMouseDown(n)},e.prototype.TouchLeave=function(t){t.preventDefault();var e=this.filterTouch(t.changedTouches);null!==e&&this.onMouseLeave(e)},e.prototype.TouchEnd=function(t){var e=this.filterTouch(t.changedTouches);null!==e&&(this.onMouseUp(e),this.currentTouch=null)},e.prototype.TouchMove=function(t){t.preventDefault();var e=this.filterTouch(t.changedTouches);null!==e&&this.onMouseMove(e)},e.prototype.filterTouch=function(t){for(var e=0;e<t.length;e++){var n=t[e];if(n.identifier===this.currentTouch)return n}return null},e}(o["default"]);Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=i},,,function(t,e,n){"use strict";var r=n(1),o=n(8),i=n(11),s=function(){function t(t,e){var n=this;this.events=e,this.recording=!1,this.initSuccessful=!1,this.doNotStartRecording=!1,this.settings={host:"http://localhost",port:4e3,path:"/upload/audio",recordingWorkerPath:"/js/workers/RecordingWorker.js"},t.host&&(this.settings.host=t.host),t.port&&(this.settings.port=t.port),t.path&&(this.settings.path=t.path),this.recording=!1,this.muted=!1,this.events.on(r.VideoEventType.MuteAudioRecording,function(){return n.muted=!n.muted}),this.error=function(t){return console.log("AudioRecorder error: ",t)},this.success=function(t){return console.log("AudioRecorder success: ",t)}}return t.prototype.Init=function(t){var e=this;if(navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia,navigator.getUserMedia&&window.hasOwnProperty("AudioContext")){var n=new AudioContext||null;this.events.trigger(r.VideoEventType.Busy),navigator.getUserMedia({video:!1,audio:!0},function(o){if(e.doNotStartRecording===!1){e.input=n.createMediaStreamSource(o);var i=2048;e.scriptProcessorNode=n.createScriptProcessor(i,1,1),e.scriptProcessorNode.onaudioprocess=function(t){return e.processData(t)},e.input.connect(e.scriptProcessorNode),e.scriptProcessorNode.connect(n.destination),e.initSuccessful=!0,e.CreateAudioProcessor("web-socket",e.settings,function(){return console.log("Audio recording is ready.")}),t&&t(),e.events.trigger(r.VideoEventType.AudioRecordingAvailable),e.events.trigger(r.VideoEventType.RegisterRecordingTool,"audio-recorder"),e.events.trigger(r.VideoEventType.Ready)}},function(t){"PermissionDeniedError"===t.name&&o["default"].Report(o.ErrorType.Warning,"User didn't allow microphone recording."),o["default"].Report(o.ErrorType.Warning,"Can't record audio",t),e.events.trigger(r.VideoEventType.AudioRecordingUnavailable),e.events.trigger(r.VideoEventType.Ready)})}else console.log("getUserMedia not supported by the browser"),o["default"].Report(o.ErrorType.Warning,"getUserMedia not supported by the browser"),this.events.trigger(r.VideoEventType.AudioRecordingUnavailable)},t.prototype.CreateAudioProcessor=function(t,e,n,r){var i=this;Worker?(this.recordingWorker=new Worker(e.recordingWorkerPath),this.recordingWorker.onmessage=function(t){return i.ReceiveMessageFromWorker(t)},this.recordingWorker.postMessage({cmd:"init",AudioProcessorType:t||"web-sockets",port:e.port,host:e.host,path:e.path}),n&&n()):(o["default"].Report(o.ErrorType.Fatal,"No web workers support - this feature is not supported by the browser."),r&&r())},t.prototype.Start=function(){return this.initSuccessful===!0?this.recordingWorker?(this.recording=!0,!0):(o["default"].Report(o.ErrorType.Fatal,"No audio processor was set."),!1):(this.doNotStartRecording=!0,!1)},t.prototype.Continue=function(){return this.initSuccessful?this.recordingWorker?(this.recording=!0,!0):(o["default"].Report(o.ErrorType.Fatal,"No audio processor was set."),!1):!1},t.prototype.Pause=function(){return this.initSuccessful?(this.recording=!1,!0):!1},t.prototype.Stop=function(t,e){this.success=t,this.error=e,this.initSuccessful===!0?this.Pause()&&this.recordingWorker&&this.recordingWorker.postMessage({cmd:"finish"}):(o["default"].Report(o.ErrorType.Warning,"Can't stop AudioRecorder - it wasn't ever initialised."),e())},t.prototype.isRecording=function(){return this.initSuccessful},t.prototype.processData=function(t){if(this.recording!==!1){var e=t.inputBuffer.getChannelData(0);if(this.muted)for(var n=0;n<e.length;n++)e[n]=0;this.recordingWorker&&this.recordingWorker.postMessage({cmd:"pushData",data:e})}},t.prototype.ReceiveMessageFromWorker=function(t){var e=t.data;if(!e.hasOwnProperty("type"))return console.log("Worker response is invalid (missing property 'type')",t.data),void this.error("AudioRecorder received invalid message from the worker.");switch(e.type){case"error":this.error(e.msg);case"network-error":this.WorkerNetworkError();break;case"finished":this.WorkerFinished(e);break;default:console.log("Unknown message type: ",e.type,e)}},t.prototype.WorkerFinished=function(t){this.recordingWorker.terminate(),this.recordingWorker=null,this.events.trigger(r.VideoEventType.RecordingToolFinished,"audio-recorder");for(var e=[],n=0;n<t.files.length;n++){var o=t.files[n],s=new i.AudioSource(o.url,i.AudioSource.StringToType(o.type));e.push(s)}this.success(e)},t.prototype.WorkerNetworkError=function(){this.events.trigger(r.VideoEventType.AudioRecordingUnavailable)},t}();Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=s},,function(t,e,n){"use strict";var r=n(4),o=n(1),i=function(){function t(t,e,n,r,o,i){var s=this;this.events=t,this.pathFactory=e,this.slowSimulation=n,this.minBrushSize=r,this.maxBrushSize=o,this.minMass=1,this.maxMass=10,this.minFriction=.4,this.maxFriction=.6,this.brushes={},this.oneFrame=1e3/60,this.cursor=new u(!0,i),n===!0?requestAnimationFrame(function(t){s.lastAnimationTime=t,s.Tick(t)}):requestAnimationFrame(function(){return s.TickWhile()})}return t.prototype.SetBrushSize=function(t){this.currentBrushSize=t},t.prototype.interpolateMass=function(t){return this.minMass+(this.maxMass-this.minMass)*(t-this.minBrushSize)/(this.maxBrushSize-this.minBrushSize)},t.prototype.interpolateFriction=function(t){return this.maxFriction-(this.maxFriction-this.minFriction)*(t-this.minBrushSize)/(this.maxBrushSize-this.minBrushSize)},t.prototype.GetBrush=function(t){return this.brushes[t]||(this.brushes[t]=new a(this.interpolateMass(t),this.interpolateFriction(t),t)),this.brushes[t]},t.prototype.ObserveCursorMovement=function(t){try{var e=new r["default"](t.X,t.Y);t.Pressure>0?this.lastState&&0!==this.lastState.Pressure?this.NextPoint(e,t.Pressure):(this.path=this.pathFactory(),this.events.trigger(o.VideoEventType.StartPath,this.path),this.StartPath(e,t.Pressure)):this.lastState&&this.lastState.Pressure>0&&this.EndPath(e,this.lastState.Pressure)}catch(n){console.log("ProcessNewState error: ",n)}this.lastState=t},t.prototype.StartPath=function(t,e){this.cursor.Reset(t,this.GetBrush(this.currentBrushSize.Size)),this.position=t,this.pressure=e,this.cursor.StartPath(this.path,t,e)},t.prototype.NextPoint=function(t,e){this.position=t,this.pressure=e},t.prototype.EndPath=function(t,e){this.position=t},t.prototype.TickWhile=function(){var t=this;if(this.position){var e=0,n=0;do e=this.cursor.ApplyForce(this.position),n+=e,n>this.currentBrushSize.Size&&(this.cursor.Draw(this.path,this.pressure),n=0);while(e>0);n>0&&this.cursor.Draw(this.path,this.pressure),this.position=null}requestAnimationFrame(function(e){return t.TickWhile()})},t.prototype.Tick=function(t){var e=this;this.path&&(this.cursor.ApplyForce(this.position)>0?this.cursor.Draw(this.path,this.pressure):this.position||(this.path=null)),this.lastAnimationTime=t,requestAnimationFrame(function(t){return e.Tick(t)})},t}();Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=i;var s,a=function(){function t(t,e,n){this.mass=t,this.friction=e,this.size=n}return Object.defineProperty(t.prototype,"Mass",{get:function(){return this.mass},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"Friction",{get:function(){return this.friction},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"Size",{get:function(){return this.size},enumerable:!0,configurable:!0}),t}();!function(t){t[t.Velocity=1]="Velocity"}(s||(s={}));var u=function(){function t(t,e){this.calculateSpeed=t,this.timer=e}return t.prototype.Reset=function(t,e){this.brush=e,this.position=t.clone(),this.startPosition=t.clone(),this.previousPosition=t.clone(),this.previousPressure=-1,this.mousePosition=t.clone(),this.acceleration=new r["default"](0,0),this.velocity=new r["default"](0,0),this.firstSegment=!0},t.prototype.ApplyForce=function(t){if(null!==t){var e=t.clone().subtract(this.position);this.acceleration=e.clone().scale(1/this.brush.Mass),this.velocity.add(this.acceleration),this.mousePosition=t}return this.velocity.scale(1-this.brush.Friction),this.velocity.getSizeSq()<1?0:(t=null,e=null,this.acceleration=null,this.angle=this.velocity.getNormal(),this.position.add(this.velocity),this.velocity.getSizeSq())},t.prototype.Draw=function(t,e){var n=this.calculateSpeed===!0?this.velocity.getSize()/(this.brush.Size*this.brush.Size):0,r=this.getRadius(e,n);this.angle.scale(r),this.firstSegment&&(t.InitPath(this.startPosition.clone().add(this.angle),this.startPosition.clone().subtract(this.angle)),this.firstSegment=!1),t.ExtendPath(this.position.clone().add(this.angle),this.position.clone().subtract(this.angle)),t.Draw()},t.prototype.StartPath=function(t,e,n){t.StartPath(e,this.getRadius(n,0))},t.prototype.getRadius=function(t,e){this.previousPressure<0&&(this.previousPressure=t);var n=this.interpolatePressure(t),r=this.speedFactor(e)*this.brush.Size*n/2;return this.previousPosition=this.position.clone(),this.previousPressure=n,r},t.prototype.interpolatePressure=function(t){var e=this.position.distanceTo(this.previousPosition),n=this.position.distanceTo(this.mousePosition);return 0===e&&0===n?t:e/(e+n)*(t-this.previousPressure)+this.previousPressure},t.prototype.speedFactor=function(t){return Math.max(1-t,.4)},t.threshold=.001,t}()},function(t,e,n){"use strict";var r=n(3),o=n(1),i=n(4),s=n(12),a=function(){function t(t){void 0===t&&(t=!0),this.curved=t}return t.prototype.SetEvents=function(t){this.events=t},t.prototype.CreateCanvas=function(){this.svg=r["default"].CreateElement("svg");var t=r["default"].CreateElement("g");return this.bg=r["default"].CreateElement("rect",{id:"background"}),t.appendChild(this.bg),this.svg.appendChild(t),this.canvas=r["default"].CreateElement("g",{id:"canvas"}),this.svg.appendChild(this.canvas),this.svg},t.prototype.Stretch=function(){var t=this.svg.parentElement,e=t.clientWidth,n=t.clientHeight;r["default"].SetAttributes(this.svg,{width:e,height:n}),r["default"].SetAttributes(this.bg,{width:e,height:n}),this.events.trigger(o.VideoEventType.CanvasSize,e,n)},t.prototype.ClearCanvas=function(t){for(;this.canvas.firstChild;)this.canvas.removeChild(this.canvas.firstChild);r["default"].SetAttributes(this.bg,{fill:t.CssValue})},t.prototype.SetCurrentColor=function(t){this.currentColor=t},t.prototype.CreatePath=function(t){return new s.SvgPath(t,this.curved,this.currentColor.CssValue,this.canvas)},t.prototype.SetupOutputCorrection=function(t,e){var n=this.svg.clientWidth/t,s=this.svg.clientHeight/e,a=Math.min(n,s);return r["default"].SetAttributes(this.svg,{viewBox:"0 0 "+t+" "+e}),a===n?this.events.trigger(o.VideoEventType.CursorOffset,new i["default"](0,(this.svg.clientHeight-e*a)/2)):this.events.trigger(o.VideoEventType.CursorOffset,new i["default"]((this.svg.clientWidth-t*a)/2,0)),a},t}();Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=a},function(t,e,n){"use strict";var r=function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},o=n(5),i=n(1),s=n(2),a=function(t){function e(e,n,r){var o=this;t.call(this,""),this.events=e,this.SetColor(n),this.GetHTML().onclick=function(t){return r?r():o.ChangeColor(t)}}return r(e,t),e.prototype.ChangeColor=function(t){e.active&&e.active.GetHTML().classList.remove("active"),this.GetHTML().classList.add("active"),e.active=this,this.events.trigger(i.VideoEventType.ChangeColor,this.color)},e.prototype.SetColor=function(t){this.color=t,s["default"].SetAttributes(this.GetHTML(),{"class":"option","data-color":t.CssValue,style:"background-color: "+t.CssValue})},e}(o.Button);e.ChangeColorButton=a;var u=function(t){function e(e,n){var r=this;t.call(this,""),this.events=e,this.size=n;var o=s["default"].CreateElement("span",{style:"width: "+n.CssValue+";	\n						height: "+n.CssValue+";\n						border-radius: "+n.Size/2+n.Unit+"; \n						display: inline-block;\n						background: black;\n						margin-top: "+-n.Size/2+n.Unit+";","class":"dot","data-size":n.Size});this.GetHTML().appendChild(o),s["default"].SetAttributes(this.GetHTML(),{"class":"option","data-size":n.Size}),this.GetHTML().onclick=function(t){return r.ChangeSize(t)}}return r(e,t),e.prototype.ChangeSize=function(t){t.preventDefault(),e.active&&e.active.GetHTML().classList.remove("active"),this.GetHTML().classList.add("active"),e.active=this,this.events.trigger(i.VideoEventType.ChangeBrushSize,this.size)},e}(o.Button);e.ChangeBrushSizeButton=u},,,function(t,e,n){"use strict";var r=function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},o=n(1),i=n(2),s=n(6),a=n(5),u=n(30),c=n(19),h=n(7),l=function(t){function e(e,n){t.call(this,"div",e+"-recorder"),this.id=e,this.events=n,this.tickingInterval=100,this.AddClass("vector-video-wrapper"),this.isRecording=!1,this.isBusy=!1,this.micIsMuted=!1}return r(e,t),Object.defineProperty(e.prototype,"Width",{get:function(){return this.board.Width},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"Height",{get:function(){return this.board.Height},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"BackgroundColor",{get:function(){return h["default"].BackgroundColor.CssValue},enumerable:!0,configurable:!0}),e.prototype.CreateHTML=function(t,e,n){this.board=this.CreateBoard(),this.controls=new a.Panel("div",this.id+"-controls").AddChildren(this.CreateButtonsPanel().AddClass("ui-controls-panel"),this.CreateColorsPanel(e).AddClass("ui-controls-panel"),this.CreateBrushSizesPanel(n).AddClass("ui-controls-panel"),this.CreateEraserPanel().AddClass("ui-controls-panel"),this.CreateEraseAllPanel().AddClass("ui-controls-panel"),this.CreateMicPanel().AddClass("ui-controls-panel")).AddClasses("ui-controls","ui-control"),!!t&&this.controls.AddClass("autohide"),this.AddChildren(this.board,new a.Panel("div").AddClass("ui-controls-wrapper").AddChild(this.controls))},e.prototype.Busy=function(){this.AddClass("busy"),this.isBusy=!0},e.prototype.Ready=function(){this.RemoveClass("busy"),this.isBusy=!1},e.prototype.SetBusyText=function(t){i["default"].SetAttributes(this.GetHTML(),{"data-busy-string":t})},e.prototype.AcceptCanvas=function(t){this.board.GetHTML().appendChild(t)},e.prototype.CreateBoard=function(){var t=new c["default"](this.id+"-board",this.events);return t},e.prototype.CreateButtonsPanel=function(){var t=this,e=new a.Panel("div",this.id+"-panels");return this.recPauseButton=new a.IconButton("icon-rec",this.Localization.Record,function(e){return t.RecordPause()}),this.uploadButton=new a.IconButton("icon-upload",this.Localization.Upload,function(e){return t.InitializeUpload()}),i["default"].SetAttributes(this.uploadButton.GetHTML(),{disabled:"disabled"}),e.AddChildren(new a.H2(this.Localization.RecPause),new a.Panel("div").AddClass("btn-group").AddChildren(this.recPauseButton,this.uploadButton)),e},e.prototype.RecordPause=function(){this.isRecording===!0?(this.PauseRecording(),this.uploadButton.GetHTML().removeAttribute("disabled"),this.RemoveClass("recording")):(this.StartRecording(),i["default"].SetAttributes(this.uploadButton.GetHTML(),{disabled:"disabled"}),this.AddClass("recording"))},e.prototype.StartRecording=function(){var t=this;this.isRecording===!1&&(this.isRecording=!0,this.recPauseButton.ChangeIcon("icon-pause"),this.board.IsRecording=!0,this.ticking=setInterval(function(){return t.Tick()},this.tickingInterval),this.events.trigger(o.VideoEventType.Start))},e.prototype.PauseRecording=function(){this.isRecording===!0&&(this.isRecording=!1,this.recPauseButton.ChangeIcon("icon-rec"),this.board.IsRecording=!1,clearInterval(this.ticking),this.events.trigger(o.VideoEventType.Pause))},e.prototype.Tick=function(){this.recPauseButton.ChangeContent(s.millisecondsToString(this.Timer.CurrentTime()))},e.prototype.InitializeUpload=function(){i["default"].SetAttributes(this.recPauseButton.GetHTML(),{disabled:"disabled"}),i["default"].SetAttributes(this.uploadButton.GetHTML(),{disabled:"disabled"}),this.events.trigger(o.VideoEventType.StartUpload)},e.prototype.CreateColorsPanel=function(t){for(var e=new a.Panel("div").AddClass("btn-group"),n=0;n<t.length;n++){var r=new u.ChangeColorButton(this.events,t[n]);e.AddChild(r)}return new a.Panel("div").AddClass("color-pallete").AddChildren(new a.H2(this.Localization.ChangeColor),e)},e.prototype.CreateBrushSizesPanel=function(t){for(var e=new a.Panel("div").AddClass("btn-group"),n=0;n<t.length;n++)e.AddChild(new u.ChangeBrushSizeButton(this.events,t[n]));return new a.Panel("div").AddClass("brush-sizes").AddChildren(new a.H2(this.Localization.ChangeSize),e)},e.prototype.CreateEraserPanel=function(){return this.switchToEraserButton=new u.ChangeColorButton(this.events,h["default"].BackgroundColor),new a.Panel("div",this.id+"-erase").AddChildren(new a.H2(this.Localization.Erase),this.switchToEraserButton)},e.prototype.CreateEraseAllPanel=function(){var t=this,e=new a.Panel("div",this.id+"-erase"),n=new a.H2(this.Localization.EraseAll);return e.AddChild(n),this.eraseAllButton=new u.ChangeColorButton(this.events,h["default"].BackgroundColor,function(){return t.EraseAll()}),this.events.on(o.VideoEventType.ChangeColor,function(e){t.currentColor=e,t.eraseAllButton.SetColor(e)}),e.AddChild(this.eraseAllButton),e},e.prototype.EraseAll=function(){this.events.trigger(o.VideoEventType.ClearCanvas,this.currentColor),this.switchToEraserButton.SetColor(this.currentColor)},e.prototype.CreateMicPanel=function(){var t=this;return this.micButton=new a.IconOnlyButton("icon-mic-off",this.Localization.AudioRecordingUnavailable,function(){return t.MuteMic()}),i["default"].SetAttributes(this.micButton.GetHTML(),{disabled:"disabled"}),this.events.on(o.VideoEventType.AudioRecordingAvailable,function(){t.micButton.GetHTML().removeAttribute("disabled"),t.micIsMuted||t.micButton.ChangeIcon("icon-mic").ChangeContent(t.Localization.AudioRecordingAvailable)}),this.events.on(o.VideoEventType.AudioRecordingUnavailable,function(){t.micButton.ChangeIcon("icon-mic-off").ChangeContent(t.Localization.AudioRecordingUnavailable),i["default"].SetAttributes(t.micButton.GetHTML(),{disabled:"disabled"})}),new a.Panel("div").AddChildren(new a.H2(this.Localization.AudioRecording),this.micButton)},e.prototype.MuteMic=function(){this.events.trigger(o.VideoEventType.MuteAudioRecording),this.micIsMuted=!this.micIsMuted,this.micIsMuted?this.micButton.ChangeIcon("icon-mic-off"):this.micButton.ChangeIcon("icon-mic")},e}(a.Panel);Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=l},,function(t,e,n){"use strict";var r=function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},o=n(23),i=function(t){function e(e,n,r,o){var i=this;t.call(this,e,n,r,o),this.board.onmousemove=function(t){return i.checkForce(t.webkitForce)},this.forceLevel=0}return r(e,t),e.isAvailable=function(){
return"WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN"in MouseEvent},e.prototype.GetPressure=function(){return this.forceLevel},e.prototype.checkForce=function(t){this.forceLevel=Math.min(1,t)},e}(o["default"]);Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=i},function(t,e,n){"use strict";var r=function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},o=n(13),i=function(t){function e(e,n,r){var o=this;t.call(this,e,n,r),this.board.addEventListener("pointermove",function(t){return o.onPointerMove(t)}),this.board.addEventListener("pointerdown",function(t){return o.onPointerDown(t)}),this.board.addEventListener("pointerup",function(t){return o.onPointerUp(t)}),this.board.addEventListener("pointerleave",function(t){return o.onPointerLeave(t)}),this.board.addEventListener("pointerenter",function(t){return o.onPointerLeave(t)}),this.board.addEventListener("pointerover",function(t){return o.onPointerOver(t)}),this.currentEvent=null,this.isDown=!1}return r(e,t),e.prototype.GetPressure=function(){return this.isDown===!1||null===this.currentEvent?0:"pen"===this.currentEvent.pointerType?this.currentEvent.pressure:1},e.prototype.InitControlsAvoiding=function(){for(var t=this,e=document.getElementsByClassName("ui-control"),n=0;n<e.length;n++){var r=e[n];r.onpointerover=function(e){return t.isHoveringOverUIControl=!0},r.onpointerout=function(e){return t.isHoveringOverUIControl=!1}}},e.prototype.onPointerMove=function(t){this.onMove(t),this.currentEvent=t},e.prototype.onPointerDown=function(t){this.onDown(t),this.currentEvent=t},e.prototype.onPointerUp=function(t){this.onUp(t),this.currentEvent=t},e.prototype.onPointerLeave=function(t){this.onLeave(t),this.currentEvent=t},e.prototype.onPointerEnter=function(t){0===t.buttons&&(this.isDown=!1),this.currentEvent=t},e.prototype.onPointerOver=function(t){this.isInside=!0,this.currentEvent=t},e}(o["default"]);Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=i},function(t,e,n){"use strict";var r,o=function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},i=n(22),s=n(2);!function(t){t[t.OutOfProximity=0]="OutOfProximity",t[t.Pen=1]="Pen",t[t.Mouse=2]="Mouse",t[t.Eraseer=3]="Eraseer"}(r||(r={}));var a=function(t){function e(e,n,r,o){t.call(this,e,n,r),this.penApi=o}return o(e,t),e.Factory=function(t){return function(n,r,o){return new e(n,r,o,t)}},e.prototype.GetPressure=function(){return this.isDown===!1||this.isInside===!1?0:this.penApi&&this.penApi.pointerType==r.Pen?this.isInside===!0?this.penApi.pressure:0:t.prototype.GetPressure.call(this)},e.IsAvailable=function(){var t=s["default"].CreateElement("object",{type:"application/x-wacomtabletplugin"});return document.body.appendChild(t),1==!!t.version?(console.log("Wacom tablet is connected and plugin installed. Plugin version is "+t.version+"."),t.penAPI):null},e}(i["default"]);Object.defineProperty(e,"__esModule",{value:!0}),e["default"]=a}]);
//# sourceMappingURL=recorder.js.map