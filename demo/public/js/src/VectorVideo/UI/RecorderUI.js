/// <reference path="BasicElements" />
/// <reference path="Buttons" />
/// <reference path="Color" />
/// <reference path="Brush" />
/// <reference path="Board" />
/// <reference path="../Helpers/VideoEvents" />
/// <reference path="../Localization/IRecorderLocalization" />
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
        function RecorderUI(id, colorPallete, brushSizes, localization, timer) {
            _super.call(this, "div", id + "-recorder");
            this.id = id;
            this.localization = localization;
            this.timer = timer;
            /** Ticking interval */
            this.tickingInterval = 100;
            this.GetHTML().classList.add("vector-video-wrapper");
            // prepare the board
            this.board = this.CreateBoard();
            this.AddChild(this.board);
            // prepare the panels
            var controls = new UI.Panel("div", id + "-controls");
            controls.GetHTML().classList.add("vector-video-controls");
            controls.GetHTML().classList.add("autohide");
            controls.GetHTML().classList.add("ui-control");
            var buttons = this.CreateButtonsPanel();
            buttons.GetHTML().classList.add("vector-video-buttons");
            var colorsPanel = this.CreateColorsPanel(colorPallete);
            colorsPanel.GetHTML().classList.add("vector-video-colors");
            var sizesPanel = this.CreateBrushSizesPanel(brushSizes);
            sizesPanel.GetHTML().classList.add("vector-video-sizes");
            var eraserPanel = this.CreateEraserPanel();
            eraserPanel.GetHTML().classList.add("vector-video-erase");
            var eraseAllPanel = this.CreateEraseAllPanel();
            eraseAllPanel.GetHTML().classList.add("vector-video-erase");
            controls.AddChildren([buttons, colorsPanel, sizesPanel, eraserPanel, eraseAllPanel]);
            this.controls = controls;
            this.AddChild(this.controls);
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
                return UI.Color.BackgroundColor.CssValue;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Integrate the canvas into the UI elements tree
         */
        RecorderUI.prototype.AcceptCanvas = function (canvas) {
            this.board.GetHTML().appendChild(canvas);
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
            var _this = this;
            var title = new UI.SimpleElement("h2", this.localization.RecPause);
            var buttonsPanel = new UI.Panel("div", this.id + "-panels");
            // the rec/pause button:
            this.recPauseButton = new UI.IconButton("icon-rec", this.localization.Record, function (e) { return _this.RecordPause(); });
            // the upload button:
            this.uploadButton = new UI.IconButton("icon-upload", this.localization.Upload, function (e) { return _this.InitializeUpload(); });
            Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
            buttonsPanel.AddChildren([title, this.recPauseButton, this.uploadButton]);
            return buttonsPanel;
        };
        /**
         * This function is called when the REC/PAUSE button is clicked.
         */
        RecorderUI.prototype.RecordPause = function () {
            if (this.isRecording === true) {
                this.PauseRecording();
                this.uploadButton.GetHTML().removeAttribute("disabled");
                this.GetHTML().classList.remove("recording");
            }
            else {
                this.StartRecording();
                Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
                this.GetHTML().classList.add("recording");
            }
        };
        /**
         * Start (or continue) recording
         */
        RecorderUI.prototype.StartRecording = function () {
            var _this = this;
            this.isRecording = true;
            this.recPauseButton.ChangeIcon("icon-pause");
            this.board.IsRecording = true;
            this.ticking = setInterval(function () { return _this.Tick(); }, this.tickingInterval);
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.Start);
        };
        /**
         * Pause recording
         */
        RecorderUI.prototype.PauseRecording = function () {
            this.isRecording = false;
            this.recPauseButton.ChangeIcon("icon-rec");
            this.board.IsRecording = false;
            clearInterval(this.ticking);
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.Pause);
        };
        /**
         * Update the displayed time
         */
        RecorderUI.prototype.Tick = function () {
            this.recPauseButton.ChangeContent(Helpers.millisecondsToString(this.timer.CurrentTime()));
        };
        RecorderUI.prototype.InitializeUpload = function () {
            // disable the record and upload buttons
            Helpers.HTML.SetAttributes(this.recPauseButton.GetHTML(), { "disabled": "disabled" });
            Helpers.HTML.SetAttributes(this.uploadButton.GetHTML(), { "disabled": "disabled" });
            // trigger upload
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.StartUpload);
        };
        /**
         * Create a panel for changing colors
         * @param	brushSizes	List of possible brush colors
         */
        RecorderUI.prototype.CreateColorsPanel = function (colorPallete) {
            var panel = new UI.Panel("div", "color-pallete");
            var title = new UI.SimpleElement("h2", this.localization.ChangeColor);
            panel.AddChild(title);
            for (var i = 0; i < colorPallete.length; i++) {
                var btn = new UI.ChangeColorButton(colorPallete[i]);
                panel.AddChild(btn);
                if (i === 0) {
                    btn.GetHTML().click();
                }
            }
            return panel;
        };
        /**
         * Create a panel for changing brush size
         * @param	brushSizes	List of possible brush sizes
         */
        RecorderUI.prototype.CreateBrushSizesPanel = function (brushSizes) {
            var panel = new UI.Panel("div", "brush-sizes");
            var title = new UI.SimpleElement("h2", this.localization.ChangeSize);
            panel.AddChild(title);
            for (var i = 0; i < brushSizes.length; i++) {
                var btn = new UI.ChangeBrushSizeButton(brushSizes[i]);
                panel.AddChild(btn);
                if (i === 0) {
                    btn.GetHTML().click();
                }
            }
            return panel;
        };
        /**
         * Create a panel containing the eraser brush and the "erase all button"
         */
        RecorderUI.prototype.CreateEraserPanel = function () {
            var panel = new UI.Panel("div", this.id + "-erase");
            var title = new UI.SimpleElement("h2", this.localization.Erase);
            panel.AddChild(title);
            this.switchToEraserButton = new UI.ChangeColorButton(UI.Color.BackgroundColor);
            // the eraser button
            panel.AddChild(this.switchToEraserButton);
            return panel;
        };
        /**
         * Create a panel containing the eraser brush and the "erase all button"
         */
        RecorderUI.prototype.CreateEraseAllPanel = function () {
            var _this = this;
            var panel = new UI.Panel("div", this.id + "-erase");
            var title = new UI.SimpleElement("h2", this.localization.EraseAll);
            panel.AddChild(title);
            // the "erase all" button:
            this.eraseAllButton = new UI.ChangeColorButton(UI.Color.BackgroundColor, function () { return _this.EraseAll(); });
            Helpers.VideoEvents.on(Helpers.VideoEventType.ChangeColor, function (color) {
                _this.currentColor = color;
                _this.eraseAllButton.SetColor(color);
            });
            panel.AddChild(this.eraseAllButton);
            return panel;
        };
        /**
         * Clear the canvas
         */
        RecorderUI.prototype.EraseAll = function () {
            Helpers.VideoEvents.trigger(Helpers.VideoEventType.ClearCanvas, this.currentColor);
            this.switchToEraserButton.SetColor(this.currentColor);
        };
        return RecorderUI;
    })(UI.Panel);
    UI.RecorderUI = RecorderUI;
})(UI || (UI = {}));
