
var RecorderUI = (function() {

	// private variables
	var settings = {
		pallete: {
			white: "#ffffff",
			yellow: "#fbff06"
		},
		widths: {
			narrow: 1, // in pixels!!
			normal: 3,
			wide: 5
		},
		defaultColor: "yellow",
		defaultSize: "normal",
		buttonsCotainer: undefined,
		colorsPanel: undefined,
		brushSizesPanel: undefined
	};
	var currentSettings;

	var playing;
	var btn, uploadBtn, modal;
	var uploadModal;
	var progress;


	function RecorderUI(options) {
		$.extend(true, settings, options);

		// set settings before creating the panels - so default settings can by highlighted
		currentSettings = {
			color: settings.pallete[settings.defaultColor],
			brushSize: settings.widths[settings.defaultSize]
		};

		prepareButtons.call(this, settings.buttonsContainer);

		prepareUploadModal.call(this);

		// create the panels for sellecting colors and sizes
		prepareColorPanel.call(this, settings.colorsPanel);
	}

	var prepareButtons = function(container) {

		// rec button
		btn = UIFactory.button("success");
		progressSpan = $("<span></span>").text("REC");
		var glyphicon = UIFactory.glyphicon("record");
		btn.append(glyphicon).append(progressSpan);
		container.append(btn);

		// uplaod button
		uploadBtn = UIFactory.button("default").attr("disabled", "disabled");
		var uploadIcon = UIFactory.glyphicon("upload");
		uploadBtn.append(uploadIcon).append("<span>UPLOAD</span>");
		container.append(uploadBtn);

		playing = false;
		btn.on("click", function() {
			if(playing == false) {
				start();
			} else {
				stop();
			}

			playing = !playing;
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

		var time = 0;
		tick = setInterval(function() {
			time += 1;
			progressSpan.text(secondsToString(time));
		}, 1000);

	};

	var stop = function() {
		UIFactory.changeButton(btn, "success"); // success = green -> recording is OFF, can start again
		progressSpan.text("REC");
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
										)


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
			VideoEvents.trigger("upload-recorded-data", {
				url: "save.php",
				mp3url: "upload-mp3.php",
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
	};

	var prepareColorPanel = function(panel) {
		var changeColor = function(button) {
			button.addClass("active").siblings().removeClass("active");
			VideoEvents.trigger("color-change", button.data("color"));
		};

		for (var color in settings.pallete) {
			var button = addColorButton(panel, color, settings.pallete[color]);
			button.on("click", function() {
				changeColor($(this));
			});
		}

		// @todo the same with sizes
	};

	var addColorButton = function(panel, colorName, colorValue) {
		var button = $("<button></button>").data("color", colorValue).css("background-color", colorValue).attr("title", colorName);
		if(colorValue == settings.color) {
			button.addClass("active");
		}
		panel.append(button);
		return button;
	};

	return RecorderUI;

})();