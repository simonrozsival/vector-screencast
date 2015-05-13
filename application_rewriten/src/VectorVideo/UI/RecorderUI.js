/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Modal" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="../Drawing/IDrawingStrategy" />
/// <reference path="../Helpers/HelperFunctions" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    /**
     * This class wraps the whole UI of the recorder.
     */
    var RecorderUI = (function (_super) {
        __extends(RecorderUI, _super);
        /**
         * Create a new instance of Recorder UI
         * @param	id				Unique ID of this recorder instance
         * @param	brushSizes		List of possible brush colors
         * @param	brushSizes		List of possible brush sizes
         * @param	localization	List of translated strings
         */
        function RecorderUI(id, colorPallete, brushSizes, localization) {
            _super.call(this, "div", id + "-recorder");
            this.id = id;
            this.localization = localization;
            /** The time of recording in milliseconds */
            this.recordingTime = 0;
            /** Ticking interval */
            this.tickingInterval = 100;
            // prepare the board
            this.board = this.CreateBoard();
            this.AddChild(this.board);
            // prepare the panels
            var controls = new UI.Panel("div", id + "-controls");
            var buttons = this.CreateButtonsPanel();
            var colorsPanel = this.CreateColorsPanel(colorPallete);
            var sizesPanel = this.CreateBrushSizesPanel(brushSizes);
            controls.AddChildren([buttons, colorsPanel, sizesPanel]);
            this.AddChild(controls);
        }
        Object.defineProperty(RecorderUI.prototype, "Width", {
            /** Get the width of the board in pixels. */
            get: function () {
                return this.board.Width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecorderUI.prototype, "Height", {
            /** Get the height of the board in pixels. */
            get: function () {
                return this.board.Height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecorderUI.prototype, "BackgroundColor", {
            /** Get the background color of the board. */
            get: function () {
                return this.board.BackgroundColor;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Integrate the canvas into the UI elements tree
         */
        RecorderUI.prototype.AcceptCanvas = function (canvas) {
            this.board.AddChild(canvas);
        };
        /**
         * Create the
         */
        RecorderUI.prototype.CreateBoard = function () {
            var board = new UI.Board(this.id + "-board");
            return board;
        };
        /**
         * Create a panel containing the REC/Pause button and the upload button.
         */
        RecorderUI.prototype.CreateButtonsPanel = function () {
            var buttonsPanel = new UI.Panel("div", this.id + "-pannels");
            this.recPauseButton = new UI.Button(this.localization.Record, this.RecordPause);
            this.uploadButton = new UI.Button(this.localization.Upload, this.ShowInfoModal);
            buttonsPanel.AddChildren([this.recPauseButton, this.uploadButton]);
            return buttonsPanel;
        };
        /**
         * This function is called when the REC/PAUSE button is clicked.
         */
        RecorderUI.prototype.RecordPause = function () {
            if (this.isRecording === true) {
                this.PauseRecording();
            }
            else {
                this.StartRecording();
            }
        };
        /**
         * Start (or continue) recording
         */
        RecorderUI.prototype.StartRecording = function () {
            this.isRecording = true;
            this.recPauseButton.GetHTML().classList.add("ui-recording");
            this.recPauseButton.GetHTML().innerText = Helpers.millisecondsToString(this.recordingTime);
            this.ticking = setInterval(this.Tick, this.tickingInterval);
            VideoEvents.trigger(VideoEventType.Start);
        };
        /**
         * Pause recording
         */
        RecorderUI.prototype.PauseRecording = function () {
            this.isRecording = false;
            this.recPauseButton.GetHTML().classList.remove("ui-recording");
            this.recPauseButton.GetHTML().innerText = this.localization.Record;
            clearInterval(this.ticking);
            VideoEvents.trigger(VideoEventType.Pause);
        };
        /**
         * Update the displayed time
         */
        RecorderUI.prototype.Tick = function () {
            this.recordingTime += this.tickingInterval;
            this.recPauseButton.GetHTML().innerText = Helpers.millisecondsToString(this.recordingTime);
        };
        RecorderUI.prototype.ShowInfoModal = function () {
            // show modal
            var modal = new UI.FormModal(this.id + "-modal", this.localization.UploadModalTitle, this.localization.Upload, this.InitializeUpload);
            modal.AddInput("author", "Your name: ");
            modal.AddInput("title", "Video title: ");
            modal.AddTextArea("description", "Video description: ");
            // add the modal to the DOM
            this.AddChild(modal);
            modal.Show();
        };
        RecorderUI.prototype.InitializeUpload = function (results) {
            var info;
            // user's input
            info.AuthorName = results["author"];
            info.VideoTitle = results["title"];
            info.VideoDescription = results["description"];
            // trigger upload
            VideoEvents.trigger(VideoEventType.StartUpload, info);
        };
        /**
         * Create a panel for changing colors
         * @param	brushSizes	List of possible brush colors
         */
        RecorderUI.prototype.CreateColorsPanel = function (colorPallete) {
            var panel = new UI.Panel("div", "color-pallete");
            for (var i = 0; i < colorPallete.length; i++) {
                panel.AddChild(new UI.ChangeColorButton(colorPallete[i]));
            }
            return panel;
        };
        /**
         * Create a panel for changing brush size
         * @param	brushSizes	List of possible brush sizes
         */
        RecorderUI.prototype.CreateBrushSizesPanel = function (brushSizes) {
            var panel = new UI.Panel("div", "brush-sizes");
            for (var i = 0; i < brushSizes.length; i++) {
                panel.AddChild(new UI.ChangeBrushSizeButton(brushSizes[i]));
            }
            return panel;
        };
        return RecorderUI;
    })(UI.Panel);
    UI.RecorderUI = RecorderUI;
})(UI || (UI = {}));
//# sourceMappingURL=RecorderUI.js.map