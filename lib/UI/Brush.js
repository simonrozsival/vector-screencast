//namespace VectorScreencast.UI {
var BrushSize = (function () {
    function BrushSize(size) {
        this.size = size;
    }
    Object.defineProperty(BrushSize.prototype, "Size", {
        get: function () { return this.size; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrushSize.prototype, "Unit", {
        get: function () { return "px"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrushSize.prototype, "CssValue", {
        get: function () { return "" + this.Size + this.Unit; },
        enumerable: true,
        configurable: true
    });
    return BrushSize;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BrushSize;
