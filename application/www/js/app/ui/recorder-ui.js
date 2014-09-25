
var RecorderUI = (function() {

	// private variables
	var settings = {
		
		pallete: {
			white: "#ffffff",
			yellow: "#fbff06",
			red: "#fa5959",
			green: "#8cfa59",
			blue: "#59a0fa"
		},
		
		widths: {
			narrow: 5, // in pixels!!
			normal: 10,
			wide: 15
		},
		
		default: {
			color: "blue",
			size: "narrow"
		},

		cursor: {
			size: 20,
			color: "#fff"
		},

		localization: {
			noJS: "Your browser does not support JavaScript or it is turned off. Video can't be recorded without enabled JavaScript in your browser.",
			record: "Record video",
			pause: "Pause recording",
			upload: "Upload",
			changeColor: "Change brush color",
			changeSize: "Change brush size",
			waitingText: "Please be patient. Converting and uploading video usualy takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window."
		},

		container: undefined,
		containerSelector: "#recorder"

	};

	var state = {
		recording: false
	};

	var btn, uploadBtn, modal, board;
	var uploadModal;
	var progress;

	function RecorderUI(options) {
		$.extend(true, settings, options);

		var container = settings.container || $(settings.containerSelector);

		// create the board and canvas
		var board = createBoard.call(this, container);

		// create controls
		var controls = createControls.call(this, container);

		// maximize height of the elements
		container.append(controls);
		var availableHeight = container.parent().height() - controls.outerHeight(); // how much can I stretch the board?
		this.board.height(availableHeight);


		// attach board to the container - but make it over the controls
		container.prepend(board);

		createCanvas.call(this, this.board);
		VideoEvents.trigger("canvas-ready", this.canvas);

		// create the cursor cross and place it inside the board
		var cursor = new Cursor(settings.cursor)
		this.board.append(cursor.element);

		// create the modal that will show before uploading recorded data
		prepareUploadModal.call(this);

		// try to load the Wacom plugin
		var plugin = $("<object></object>").attr("id", "wtPlugin").attr("type", "application/x-wacomtabletplugin");
		$("body").append(plugin);
		VideoEvents.trigger("wacom-plugin-ready", plugin);
	}

	var createBoard = function() {
		this.board = $("<div></div>").attr("id", "board")
						.append("<noscript><p>" + settings.localization.noJS + "</p></noscript>");

		return this.board; // add it to the DOM
	};

	var createCanvas = function(board) {
		// the canvas - user will paint here
		this.canvas = $("<canvas></canvas>").attr("width", board.width()).attr("height", board.height());
		this.board.append(this.canvas);
	};

	var createControls = function() {
		// button
		var buttonContainer = $("<div></div>").attr("id", "rec-button-container");
		prepareButtons.call(this, buttonContainer);

		// progress bar
		colorsPanel = $("<div></div>").attr("id", "colors-panel");
		prepareColorsPanel(colorsPanel);
		
		// timer
		sizesPanel = $("<div></div>").attr("id", "brushes-panel");
		prepareSizesPanel(sizesPanel);

		// row
		var controls = $("<div></div>").attr("id", "controls")
							.append(buttonContainer)
							.append(colorsPanel)
							.append(sizesPanel);

		return controls;
	};

	var prepareButtons = function(container) {

		// rec button
		btn = UIFactory.button("success").attr("title", settings.localization.record);
		progressSpan = $("<span></span>").text("REC");
		var glyphicon = UIFactory.glyphicon("record");
		btn.append(glyphicon).append(progressSpan);
		container.append(btn);

		// uplaod button
		uploadBtn = UIFactory.button("default").attr("disabled", "disabled").attr("title", settings.localization.upload);
		var uploadIcon = UIFactory.glyphicon("upload");
		uploadBtn.append(uploadIcon).append("<span>" + settings.localization.upload.toUpperCase() + "</span>");
		container.append(uploadBtn);

		state.recording = false;
		var _this = this;
		btn.on("click", function() {
			if(state.recording == false) {
				start.call(_this);
				btn.attr("title", settings.localization.pause);
			} else {
				stop.call(_this);
				btn.attr("title", settings.localization.record);
			}

			state.recording = !state.recording;
		});

		uploadBtn.on("click", function() {
			modal.modal();
		});
	};

	var tick;

	var start = function() {
		UIFactory.changeButton(btn, "danger"); // danger = red -> recording is ON
		VideoEvents.trigger("start");
		uploadBtn.attr("disabled", "disabled");
		this.board.addClass("no-pointer");

		var time = 0;
		tick = setInterval(function() {
			time += 1;
			progressSpan.text(secondsToString(time));
		}, 1000);

	};

	var stop = function() {
		UIFactory.changeButton(btn, "success"); // success = green -> recording is OFF, can start again
		progressSpan.text("REC");
		this.board.removeClass("no-pointer");
		uploadBtn.removeAttr("disabled");
		VideoEvents.trigger("pause");

		clearInterval(tick);
	};

	var prepareUploadModal = function() {

		// input objects
		var titleInput = $("<input>").attr("type", "text").attr("name", "title").attr("placeholder", "video's title").addClass("form-control");
		var authorInput = $("<input>").attr("type", "text").attr("name", "author").attr("placeholder", "your name").addClass("form-control");
		var descriptionTextarea = $("<textarea />").attr("name", "description").attr("placeholder", "video description").addClass("form-control");

		// button
		var save = $("<button>").attr("type", "button").addClass("btn btn-primary").text("Save video");
        var uploadInfo = $("<div />")
        					.css("display", "none")
        					.append("<p />").addClass("alert alert-info").text(settings.localization.waitingText);

        // uploqe progress
        var uploadBar = UIFactory.progressbar("info", 0).text("0% uploaded").addClass("active progress-striped");
        var uploadProgress = $("<div />").addClass("progress").append(uploadBar);

        VideoEvents.on("upload-progress", function(e, percent) {
        	UIFactory.changeProgress(uploadBar, percent);
        	uploadBar.text(percent + "% uploaded");
        });

        //
        // This is a Twitter Bootstrap 3 modal window
        // see www.bootstrapdocs.com/v3.2.0/docs/
        //
		modal = $("<div />").addClass("modal fade").append(
						$("<div />").addClass("modal-dialog").append(
							$("<div />").addClass("modal-content")
								.append(
									// MODAL HEADER
									$("<div />").addClass("modal-header")
										.append(
											$("<button>").attr("type", "button").addClass("close").attr("data-dismiss", "modal")
												.append($("<span>").attr("aria-hidden", "true").html("&times;"))
												.append($("<span>").addClass("sr-only").text("Close"))
										).append(
											$("<h4>Save captured video</h4>").addClass("modal-title")
										)
								).append(
									// MODAL BODY
									$("<div />").addClass("modal-body")
										.append(
											// name input
											$("<p />").addClass("form-group")
												.append(titleInput)
										).append(
											$("<p />").addClass("form-group")
												.append(authorInput)
										).append(
											$("<p />").addClass("form-group")
												.append(descriptionTextarea)
										).append(uploadInfo).append(uploadProgress)

								).append(
									// MODAL FOOTER
									$("<div />").addClass("modal-footer")
										.append($("<button>").attr("type", "button").addClass("btn btn-default").attr("data-dismiss", "modal").text("Close"))
										.append(save)

								)
						)
					);

		$("body").append(modal);

		save.on("click", function() {

			// inform the user..
			$(this).attr("disabled", "disabled");
			$(this).text("Started uploading...");
			uploadInfo.slideToggle();

			VideoEvents.trigger("upload-recorded-data", {
				fileName: new Date().getTime(),
				info: { // this will be merged with the <info> structure
					about: {
						title: titleInput.val(),
						description: descriptionTextarea.val(),
						author: authorInput.val()
					}
				}
			});
		});

		VideoEvents.on("recording-finished", function() {
			save.text("Video was successfully uploaded.");
		});
	};

	var prepareColorsPanel = function(panel) {
		var changeColor = function(button) {
			button.addClass("active").siblings().removeClass("active");
			VideoEvents.trigger("color-change", button.data("color"));
		};

		Object.keys(settings.pallete).forEach(function(color) {
			var button = addColorButton(panel, color, settings.pallete[color]);
			button.on("click", function() {
				var btn = $(this);
				changeColor(btn);
			});
		});
	};

	var prepareSizesPanel = function(panel) {
		var changeSize = function(button) {
			button.addClass("active").siblings().removeClass("active");
			var size = button.children(".dot").data("size");
			VideoEvents.trigger("brush-size-change", settings.widths[size]);
		};

		Object.keys(settings.widths).forEach(function(size) {
			var button = addSizeButton(panel, size, settings.widths[size]).attr("title", settings.localization.changeSize);
			button.on("click", function() {
				changeSize($(this));
			});
		});
	};

	var addColorButton = function(panel, colorName, colorValue) {
		var button = $("<button></button>").addClass("option").data("color", colorValue).css("background-color", colorValue).attr("title", colorName);
		if(colorName == settings.default.color) {
			VideoEvents.trigger("color-change", colorValue);
			button.addClass("active");
		}
		panel.append(button);
		return button;
	};

	var addSizeButton = function(panel, sizeName, size) {
		var dot = $("<span></span>").addClass("dot").data("size", sizeName).width(size).height(size).css("border-radius", size/2 + "px");
		var button = $("<button></button>").addClass("option").attr("title", size).append(dot);
		if(sizeName == settings.default.size) {
			console.log("size: ", size);
			VideoEvents.trigger("brush-size-change", size);
			button.addClass("active");
		}
		panel.append(button);
		return button;
	};

	return RecorderUI;

})();