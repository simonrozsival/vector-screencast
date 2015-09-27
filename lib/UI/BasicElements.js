var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HTML_1 = require('../Helpers/HTML');
var SimpleElement = (function () {
    function SimpleElement(tag, content) {
        if (tag instanceof HTMLElement) {
            this.element = tag;
        }
        else {
            this.element = HTML_1.default.CreateElement(tag);
        }
        if (!!content) {
            this.element.textContent = content;
        }
    }
    SimpleElement.prototype.GetHTML = function () { return this.element; };
    SimpleElement.prototype.HasClass = function (className) {
        return this.GetHTML().classList.contains(className);
    };
    SimpleElement.prototype.AddClass = function (className) {
        return this.AddClasses(className);
    };
    SimpleElement.prototype.AddClasses = function () {
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < classes.length; i++) {
            this.GetHTML().classList.add(classes[i]);
        }
        return this;
    };
    SimpleElement.prototype.RemoveClass = function (className) {
        return this.RemoveClasses(className);
    };
    SimpleElement.prototype.RemoveClasses = function () {
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < classes.length; i++) {
            this.GetHTML().classList.remove(classes[i]);
        }
        return this;
    };
    return SimpleElement;
})();
exports.SimpleElement = SimpleElement;
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(text, onClick) {
        _super.call(this, "button");
        this.AddClass("ui-button");
        this.content = new SimpleElement("span", text);
        this.GetHTML().appendChild(this.content.GetHTML());
        if (!!onClick) {
            this.GetHTML().onclick = onClick;
        }
    }
    Button.prototype.ChangeContent = function (content) {
        this.content.GetHTML().innerHTML = content;
        return this;
    };
    return Button;
})(SimpleElement);
exports.Button = Button;
var IconButton = (function (_super) {
    __extends(IconButton, _super);
    function IconButton(iconClass, content, onClick) {
        _super.call(this, content, onClick);
        this.iconClass = iconClass;
        this.icon = new SimpleElement("span", "").AddClasses("icon", iconClass);
        this.AddClass("has-icon");
        this.GetHTML().appendChild(this.icon.GetHTML());
    }
    IconButton.prototype.ChangeIcon = function (iconClass) {
        this.icon.RemoveClass(this.iconClass).AddClass(iconClass);
        this.iconClass = iconClass;
        return this;
    };
    return IconButton;
})(Button);
exports.IconButton = IconButton;
var IconOnlyButton = (function (_super) {
    __extends(IconOnlyButton, _super);
    function IconOnlyButton(iconClass, title, onClick) {
        _super.call(this, iconClass, "", onClick);
        this.ChangeContent(title);
        this.AddClass("icon-only-button");
    }
    IconOnlyButton.prototype.ChangeContent = function (content) {
        HTML_1.default.SetAttributes(this.GetHTML(), { title: content });
        return this;
    };
    return IconOnlyButton;
})(IconButton);
exports.IconOnlyButton = IconOnlyButton;
var Heading = (function (_super) {
    __extends(Heading, _super);
    function Heading(level, text) {
        _super.call(this, "h" + level, text);
    }
    return Heading;
})(SimpleElement);
exports.Heading = Heading;
var H2 = (function (_super) {
    __extends(H2, _super);
    function H2(text) {
        _super.call(this, 2, text);
    }
    return H2;
})(Heading);
exports.H2 = H2;
var Panel = (function () {
    function Panel(tag, id) {
        this.element = HTML_1.default.CreateElement(tag);
        if (!!id) {
            HTML_1.default.SetAttributes(this.element, { id: id });
        }
        this.elements = [];
    }
    Object.defineProperty(Panel.prototype, "Children", {
        get: function () { return this.elements; },
        enumerable: true,
        configurable: true
    });
    Panel.prototype.AddChild = function (el) {
        return this.AddChildren(el);
    };
    Panel.prototype.AddChildren = function () {
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elements[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < elements.length; i++) {
            this.elements.push(elements[i]);
            this.GetHTML().appendChild(elements[i].GetHTML());
        }
        return this;
    };
    Panel.prototype.GetHTML = function () { return this.element; };
    Panel.prototype.HasClass = function (className) {
        return this.GetHTML().classList.contains(className);
    };
    Panel.prototype.AddClass = function (className) {
        return this.AddClasses(className);
    };
    Panel.prototype.AddClasses = function () {
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < classes.length; i++) {
            this.GetHTML().classList.add(classes[i]);
        }
        return this;
    };
    Panel.prototype.RemoveClass = function (className) {
        return this.RemoveClasses(className);
    };
    Panel.prototype.RemoveClasses = function () {
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < classes.length; i++) {
            this.GetHTML().classList.remove(classes[i]);
        }
        return this;
    };
    return Panel;
})();
exports.Panel = Panel;
