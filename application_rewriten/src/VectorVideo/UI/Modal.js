/// <reference path="BasicElements" />
/// <reference path="../Helpers/HTML" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var Modal = (function (_super) {
        __extends(Modal, _super);
        /**
         * Prepare the modal skeleton.
         * @param 	name			Displayed title of the modal
         * @param	buttonCaption  	The text that will be displayed in the
         */
        function Modal(id, name, closeButton) {
            // intialise the panel
            _super.call(this, "div", id);
            // build the modal
            var root = this.GetHTML();
            root.classList.add("ui-modal");
            // title
            var title = new UI.SimpleElement("h1", name);
            title.GetHTML().classList.add("ui-modal-title");
            this.AddChild(title);
            // body
            this.body = new UI.Panel("div", id + "-body");
            this.AddChild(this.body);
            // footer
            var submitBtn = new UI.Button(closeButton, this.Hide);
            var footer = new UI.Panel("div", id + "-footer");
            footer.AddChild(submitBtn);
            this.AddChild(footer);
        }
        /**
         * Show the modal
         */
        Modal.prototype.Show = function () {
            this.GetHTML().classList.add("ui-modal-shown");
        };
        /**
         * Hide the modal
         */
        Modal.prototype.Hide = function () {
            this.GetHTML().classList.remove("ui-modal-shown");
        };
        return Modal;
    })(UI.Panel);
    UI.Modal = Modal;
    /**
     *
     */
    var FormModal = (function (_super) {
        __extends(FormModal, _super);
        /**
         * @param	id				Modal element HTML id attribute
         * @param	name			Modal title
         * @param	closeButton		Close button caption
         * @param	submitResults	Callback
         */
        function FormModal(id, name, closeButton, submitResults) {
            _super.call(this, id, name, closeButton);
            this.submitResults = submitResults;
        }
        /**
         * Add an input.
         * @param	id		Identificator
         */
        FormModal.prototype.AddInput = function (id, caption) {
            this.AddFormField("input", id, caption);
        };
        /**
         * Add an input.
         * @param	id		Identificator
         */
        FormModal.prototype.AddTextArea = function (id, caption) {
            this.AddFormField("textarea", id, caption);
        };
        /**
         * Add an input.
         * @param	id		Identificator
         */
        FormModal.prototype.AddFormField = function (type, id, caption) {
            var label = new UI.SimpleElement("label", caption);
            Helpers.HTML.SetAttributes(label.GetHTML(), {
                class: "ui-modal-label",
                "for": id,
            });
            var input = new UI.SimpleElement(type);
            Helpers.HTML.SetAttributes(input.GetHTML(), {
                class: "ui-modal-input",
                name: id,
                type: "text",
            });
            var group = new UI.Panel("div", id + "-group");
            group.AddChildren([label, input]);
            // put it into the form as next item 
            this.body.AddChild(group);
        };
        /**
         * Submit the results when hiding
         */
        FormModal.prototype.Hide = function () {
            // collect results
            var results;
            for (var i = 0; i < this.inputs.length; i++) {
                var input = this.inputs[i];
                var value = input.GetHTML().tagName === "input"
                    ? input.GetHTML().nodeValue
                    : input.GetHTML().textContent; // textarea
                results[input.GetHTML().getAttribute("name")] = value;
            }
            // call user's callback
            if (!!this.submitResults) {
                this.submitResults(results);
            }
            // close the modal
            _super.prototype.Hide.call(this);
        };
        return FormModal;
    })(Modal);
    UI.FormModal = FormModal;
})(UI || (UI = {}));
//# sourceMappingURL=Modal.js.map