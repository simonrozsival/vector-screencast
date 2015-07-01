/// <reference path="../Helpers/HTML" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var HTML = Helpers.HTML;
    var SimpleElement = (function () {
        /**
         * Create a simple HTML element, that can be part of a Panel
         * @param	tag		Tag name or HTMLElement instance
         * @param	content	Optional textual content of the tag
         */
        function SimpleElement(tag, content) {
            if (typeof tag === "string") {
                this.element = HTML.CreateElement(tag);
            }
            else {
                this.element = tag;
            }
            if (!!content) {
                this.element.textContent = content;
            }
        }
        /**
         * Getter of the element.
         */
        SimpleElement.prototype.GetHTML = function () { return this.element; };
        return SimpleElement;
    })();
    UI.SimpleElement = SimpleElement;
    /**
     * A few concrete UI elements
     */
    /**
     * Basic UI button
     */
    var Button = (function (_super) {
        __extends(Button, _super);
        /**
         * Create a basic button with a text in it
         * @param	text	Button caption
         * @param	onClick	Optional click event handler
         */
        function Button(text, onClick) {
            _super.call(this, "button", text);
            if (!!onClick) {
                this.GetHTML().onclick = onClick; // no event arguments are passed on purpose
            }
        }
        return Button;
    })(SimpleElement);
    UI.Button = Button;
    /**
     * Extended UI button
     */
    var IconButton = (function (_super) {
        __extends(IconButton, _super);
        /**
         * Create a basic button with a text in it
         * @param	iconClass	CSS class of the icon
         * @param	content		The textual content of the button
         * @param	onClick	Optional click event handler
         */
        function IconButton(iconClass, content, onClick) {
            _super.call(this, "", onClick);
            // the content isn't a simple text..
            this.icon = new SimpleElement("span", "");
            this.ChangeIcon(iconClass);
            this.content = new SimpleElement("span", content);
            this.GetHTML().appendChild(this.icon.GetHTML());
            this.GetHTML().appendChild(this.content.GetHTML());
        }
        IconButton.prototype.ChangeIcon = function (iconClass) {
            HTML.SetAttributes(this.icon.GetHTML(), {
                class: "icon " + iconClass
            });
        };
        /**
         * Change the content of the button.
         * @param	content	The content - might be HTML
         */
        IconButton.prototype.ChangeContent = function (content) {
            this.content.GetHTML().innerHTML = content;
        };
        return IconButton;
    })(Button);
    UI.IconButton = IconButton;
    /**
     * Basic UI button
     */
    var Paragraph = (function (_super) {
        __extends(Paragraph, _super);
        /**
         * Create a basic button with a text in it
         */
        function Paragraph(text) {
            _super.call(this, "p", text);
        }
        return Paragraph;
    })(SimpleElement);
    UI.Paragraph = Paragraph;
    /**
     * A composite UI element
     */
    var Panel = (function () {
        /**
         * Create a new specific panel
         * @param	tag		The tag name of the panel
         * @param	id		The HTML ID of the panel
         */
        function Panel(tag, id) {
            this.root = Helpers.HTML.CreateElement(tag, {
                id: id,
                class: "ui-panel"
            });
            this.elements = [];
        }
        Object.defineProperty(Panel.prototype, "Children", {
            get: function () { return this.elements; },
            enumerable: true,
            configurable: true
        });
        /**
         * Add another button to the collection.
         * @param	btn		Button instance.
         */
        Panel.prototype.AddChild = function (el) {
            this.elements.push(el);
            this.root.appendChild(el.GetHTML());
        };
        /**
         * Add muiltiple children.
         * @param	elements	Array of elements
         */
        Panel.prototype.AddChildren = function (elements) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                this.AddChild(element);
            }
        };
        /**
         * Returns the panel element with it's children
         */
        Panel.prototype.GetHTML = function () { return this.root; };
        return Panel;
    })();
    UI.Panel = Panel;
})(UI || (UI = {}));
