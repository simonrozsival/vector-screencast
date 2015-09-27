//namespace VectorScreencast.UI {
var Color = (function () {
    function Color(cssValue) {
        this.cssValue = cssValue;
    }
    Object.defineProperty(Color.prototype, "CssValue", {
        get: function () { return this.cssValue; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Color, "BackgroundColor", {
        get: function () {
            return new Color(this.backgroundPrototype.CssValue);
        },
        set: function (c) { this.backgroundPrototype = c; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Color, "ForegroundColor", {
        get: function () {
            return new Color(this.foregroundPrototype.CssValue);
        },
        set: function (c) { this.foregroundPrototype = c; },
        enumerable: true,
        configurable: true
    });
    Color.backgroundPrototype = new Color("#111");
    Color.foregroundPrototype = new Color("#fff");
    return Color;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Color;
