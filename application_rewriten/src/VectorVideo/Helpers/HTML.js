/**
 * HTML helper.
 */
var Helpers;
(function (Helpers) {
    /**
     *
     */
    var HTML = (function () {
        function HTML() {
        }
        /**
         * Create a HTML element with specified attributes and appended children (if any)
         */
        HTML.CreateElement = function (name, attributes, children) {
            var el = document.createElement(name);
            // set attributes right away - if passed
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
        /**
         * Add attributes to a HTML element
         */
        HTML.SetAttributes = function (el, attributes) {
            for (var attr in attributes) {
                el.setAttribute(attr, attributes[attr]);
            }
        };
        return HTML;
    })();
    Helpers.HTML = HTML;
})(Helpers || (Helpers = {}));
;
//# sourceMappingURL=HTML.js.map