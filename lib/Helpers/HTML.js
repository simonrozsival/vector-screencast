//namespace VectorScreencast.Helpers {
var HTML = (function () {
    function HTML() {
    }
    HTML.CreateElement = function (name, attributes, children) {
        var el = document.createElement(name);
        if (!!attributes) {
            HTML.SetAttributes(el, attributes);
        }
        if (!!children && Array.isArray(children)) {
            for (var i in children) {
                el.appendChild(children[i]);
            }
        }
        return el;
    };
    HTML.SetAttributes = function (el, attributes) {
        for (var attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }
    };
    return HTML;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HTML;
