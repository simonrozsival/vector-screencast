/**
* Khanova Škola - vektorové video
*
* RECORDER UI
* This object creates the whole UI of recorder and takes care of user interaction.
*
* @author:		Šimon Rozsíval (simon@rozsival.com)
* @project:		Vector screencast for Khan Academy (Bachelor thesis)
* @license:		MIT
*/

var RecorderUI = (function() {

	// private variables
	var settings = {
		
		// color pallete
		// the pair is "name: (css color constant or hex color value)"
		pallete: {
			white: "#ffffff",
			yellow: "#fbff06",
			red: "#fa5959",
			green: "#8cfa59",
			blue: "#59a0fa"
		},
		
		// brush sizes
		// the pair is "name: size in pixels"
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
			waitingText: "Please be patient. Uploading video usually takes some times - up to a few minutes if your video is over ten minutes long. Do not close this tab or browser window."
		},

		container: undefined,
		containerSelector: "#recorder"

	};

	// current ui state
	var state = {
		recording: false,
		paused: false
	};

	// ui elements
	var btn, uploadBtn, modal, board, progressSpan;

	function RecorderUI(options) {
		$.extend(true, settings, options);

		var container = settings.container;

		// create the board and canvas
		var board = createBoard.call(this, container);

		// create controls
		var controls = createControls.call(this, container);

		// maximize height of the elements
		container.appendChild(controls);
		this.board.style.height = "100%";

		// attach board to the container - but make it over the controls
		container.insertBefore(board, container.firstChild);

		createCanvasContainer.call(this, this.board);
		VideoEvents.trigger("canvas-container-ready", this.canvas);

		// create the cursor cross and place it inside the board
		var cursor = new Cursor(settings.cursor)
		this.board.appendChild(cursor.element);

		// create the modal that will show before uploading recorded data
		var modal = prepareUploadModal.call(this);
		container.appendChild(modal);

		// try to load the Wacom plugin
		var plugin = HTML.createElement("object", {
			id: "wtPlugin",
			type: "application/x-wacomtabletplugin"
		});
		document.body.appendChild(plugin);
		VideoEvents.trigger("wacom-plugin-ready", plugin);
	}

	var createBoard = function() {
		this.board = HTML.createElement("div", { id: "board" }, [
			HTML.createElement("noscript", {}, [
				(function() { var p = HTML.createElement("p"); p.innerHTML = settings.localization.noJS; return p; })()
			])
		]);

		return this.board; // add it to the DOM
	};

	var createCanvasContainer = function(board) {
		// the canvas - user will paint here
		this.canvas = HTML.createElement("div", {
			id: "canvas-container",
			width: board.outerWidth,
			height: board.outerHeight
		});
		this.board.appendChild(this.canvas);
	};

	var createControls = function() {
		// button
		var buttonContainer = HTML.createElement("div", { id: "rec-button-container" });
		prepareButtons.call(this, buttonContainer);

		// progress bar
		var colorsPanel = HTML.createElement("div", { id: "colors-panel" });
		prepareColorsPanel(colorsPanel);
		
		// timer
		var sizesPanel = HTML.createElement("div", { id: "brushes-panel" });
		prepareSizesPanel(sizesPanel);

		// row
		var controls = HTML.createElement("div", { id: "controls" },
			[
				buttonContainer,
				colorsPanel,
				sizesPanel
			]);

		return controls;
	};

	/**
	 * Add play/stop and upload buttons to the container.
	 * @param {HTMLElement} container
	 */
	var prepareButtons = function(container) {

		// rec button
		btn = UIFactory.button("success");
		HTML.setAttributes(btn, { title: settings.localization.record });
		btn.innerHTML = "REC";
		container.appendChild(btn);

		// upload button
		uploadBtn = UIFactory.button("default");
		HTML.setAttributes(uploadBtn, {
			disabled: "disabled",
			title: settings.localization.upload
		});
		uploadBtn.innerHTML = settings.localization.upload.toUpperCase();
		container.appendChild(uploadBtn);

		state.recording = false;
		var _this = this;
		btn.addEventListener("mouseup", function(e) {
			e.preventDefault();
			if(state.recording === false) {
				if(state.paused) {
					continueRecording.call(_this);
				} else {
					start.call(_this);
				}
				state.paused = false;
				HTML.setAttributes(btn, {
					title: settings.localization.pause
				});
			} else {
				state.paused = true;
				pause.call(_this);
				HTML.setAttributes(btn, {
					title: settings.localization.record
				});
			}

			state.recording = !state.recording;
		});

		uploadBtn.addEventListener("mouseup", function(e) {
			e.preventDefault();
			var modal = document.getElementsByClassName("modal-bg");
			modal.className = "modal-bg active"; // activate modal
		});
	};

	var tick;

	var start = function() {
		VideoEvents.trigger("start");
		recording.call(this);
	};

	var continueRecording = function() {
		VideoEvents.trigger("continue");
		recording.call(this);
	};

	var recording = function() {
		UIFactory.changeButton(btn, "danger"); // danger = red -> recording is ON
		HTML.setAttributes(uploadBtn, { disabled: "disabled" });
		this.board.className += " no-pointer";

		var time = 0;
		tick = setInterval(function() {
			time += 1;
			btn.innerHTML = secondsToString(time);
		}, 1000);
	};

	var pause = function() {
		UIFactory.changeButton(btn, "success"); // success = green -> recording is OFF, can start again
		this.board.className.replace("no-pointer", "");
		uploadBtn.removeAttribute("disabled");
		VideoEvents.trigger("pause");

		clearInterval(tick);
	};

	var prepareUploadModal = function() {

		// input objects
		var titleInput = HTML.createElement("input", {
			type: "text",
			name: "title",
			placeholder: "video's title",
			class: "form-control"
		});
		var authorInput = HTML.createElement("input", {
			type: "text",
			name: "author",
			placeholder: "your name",
			class: "form-control"
		});
		var descriptionTextarea = HTML.createElement("textarea", {
			name: "description",
			placeholder: "video description",
			class: "form-control"
		});

		// button
		var save = HTML.createElement("button", {
			type: "button",
			class: "btn btn-primary"
		});
		save.innerHTML = "Save video";

		//
		var infoAlert = HTML.createElement("p", { class: "alert alert-info" });
		infoAlert.innerHTML = settings.localization.waitingText;
        var uploadInfo = HTML.createElement("div", { style: "display: none;" }, [ infoAlert ]);

		VideoEvents.on("upload-progress", function(e, percent) {
        	console.log(percent);
        });

		var closeBtn = HTML.createElement("button", { class: "close-btn" });
		closeBtn.innerHTML = "&times";
		closeBtn.addEventListener("mouseup", function(e) {
			e.preventDefault();
			var wrapper = document.getElementsByClassName("modal-bg");
			wrapper.className = ""; // remove "active"
			wrapper.className = "modal-bg";
		});

		var title = HTML.createElement("h4");
		title.innerHTML = "Save captured video";

		var modalBody = HTML.createElement("div", { class: "modal-body" },
			[
				HTML.createElement("p", { class: "form-group" }, [ titleInput ]),
				HTML.createElement("p", { class: "form-group" }, [ authorInput ]),
				HTML.createElement("p", { class: "form-group" }, [ descriptionTextarea ]),
				uploadInfo
			]);

		var modalFooter = HTML.createElement("div", { class: "modal-footer" },
			[
				closeBtn,
				save
			]);

		modal = HTML.createElement("div", { class: "modal" },
			[
				closeBtn,
				title,
				modalBody,
				modalFooter
			]);

		save.addEventListener("mouseup", function(e) {
			e.preventDefault();

			// inform the user..
			HTML.setAttributes(save, {
				disabled: "disabled"
			});
			save.innerHTML = "Starting upload...";
			uploadInfo.slideToggle();

			VideoEvents.trigger("stop", {
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
			save.innerHTML = "Video was successfully uploaded.";
		});

		return HTML.createElement("div", { class: "modal-bg" }, [ modal ]);
	};

	/**
	 * Creates buttons for changing colors during recording.
	 * @param  {object} panel Parent element of the buttons.	 
	 */
	var prepareColorsPanel = function(panel) {
		var changeColor = function(button) {
			var children = button.parentNode.childNodes;
			for (var i = 0; i < children.length; ++i) {
				HTML.setAttributes(children[i], { class: "option" });
			}

			HTML.setAttributes(button, { class: "option active" });
			VideoEvents.trigger("color-change", button.getAttribute("data-color"));
		};

		Object.keys(settings.pallete).forEach(function(color) {
			var button = addColorButton(panel, color, settings.pallete[color]);
			button.addEventListener("mouseup", function(e) {
				// prevent default - 
				e.preventDefault();
				changeColor(button);
			});
		});
	};

	/**
	 * Creates buttons for changing brush size during recording.
	 * @param  {HTMLElement} panel Parent element of the buttons.
	 */
	var prepareSizesPanel = function(panel) {
		/**
		 * @param {HTMLElement} button
		 */
		var changeSize = function(button) {
			// reset btns
			var children = button.parentNode.childNodes;
			for (var i = 0; i < children.length; ++i) {
				HTML.setAttributes(children[i], { class: "option" });
			}

			HTML.setAttributes(button, { class: "option active" });
			var size = button.firstChild.getAttribute("data-size"); // it has only one child
			VideoEvents.trigger("brush-size-change", settings.widths[size]);
		};

		Object.keys(settings.widths).forEach(function(size) {
			var button = addSizeButton(panel, size, settings.widths[size]);
			HTML.setAttributes(button, { title: settings.localization.changeSize });
			button.addEventListener("mouseup", function(e) {
				e.preventDefault();
				changeSize(button);
			});
		});
	};

	/**
	 * Creates a button for changing color.
	 * @param {object} 	panel      	Parent element.
	 * @param {string} 	colorName  	Displayed color name.
	 * @param {string} 	colorValue 	CSS compatible value of color.
	 * @return {object}				The button
	 */
	var addColorButton = function(panel, colorName, colorValue) {
		var button = HTML.createElement("button", {
			class: "option",
			"data-color": colorValue,
			title: colorName,
			style: "background-color: " + colorValue
		});
		if(colorName == settings.default.color) {
			VideoEvents.trigger("color-change", colorValue);
			HTML.setAttributes(button, { class: "option active" });
		}
		panel.appendChild(button);
		return button;
	};

	/**
	 * Creates a button for changing size.
	 * @param {object} 	panel      	Parent element.
	 * @param {string} 	sizeName  	Displayed size name.
	 * @param {string} 	sizeValue 	Brush diameter in pixels. // @todo chnage to percent or sth.
	 * @return {object}				The button
	 */
	var addSizeButton = function(panel, sizeName, size) {
		var dot = HTML.createElement("span", {
			class: "dot",
			"data-size": sizeName
		});
		var borderWidth = 2;
		dot.style.borderWidth = borderWidth + "px";
		dot.style.borderRadius = size/2 + "px";
		dot.style.width = (size - 2*borderWidth) + "px";
		dot.style.height = (size - 2*borderWidth) + "px";


		var button = HTML.createElement("button", {
			class: "option",
			title: size
		}, [ dot ]);

		if(sizeName == settings.default.size) {
			VideoEvents.trigger("brush-size-change", size);
			HTML.setAttributes(button, { class: "option active" });
		}

		panel.appendChild(button);

		return button;
	};

	return RecorderUI;

})();