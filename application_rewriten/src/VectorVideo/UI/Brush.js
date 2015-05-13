var UI;
(function (UI) {
    /**
     * Brush size representation.
     */
    var BrushSize = (function () {
        function BrushSize(name, size, unit) {
            this.name = name;
            this.size = size;
            this.unit = unit;
        }
        Object.defineProperty(BrushSize.prototype, "Name", {
            /**
             * Textual representation
             */
            get: function () { return this.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushSize.prototype, "Size", {
            /**
             * The size of the brush
             */
            get: function () { return this.size; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushSize.prototype, "Unit", {
            /**
             * The units of brush size
             */
            get: function () { return this.unit; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrushSize.prototype, "CssValue", {
            /**
             * The size with the unit suitable for css
             */
            get: function () { return "" + this.size + this.unit; },
            enumerable: true,
            configurable: true
        });
        return BrushSize;
    })();
    UI.BrushSize = BrushSize;
})(UI || (UI = {}));
//# sourceMappingURL=Brush.js.map