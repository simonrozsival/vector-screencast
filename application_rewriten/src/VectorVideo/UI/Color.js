var UI;
(function (UI) {
    /**
     * Color representation.
     */
    var Color = (function () {
        function Color(name, cssValue) {
            this.name = name;
            this.cssValue = cssValue;
        }
        Object.defineProperty(Color.prototype, "Name", {
            /**
             * Textual representation
             */
            get: function () { return this.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "CssValue", {
            /**
             * CSS value of the color
             */
            get: function () { return this.cssValue; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color, "BackgroundColor", {
            get: function () {
                return new Color(this.backgroundPrototype.Name, this.backgroundPrototype.CssValue);
            },
            set: function (c) { this.backgroundPrototype = c; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color, "ForegroundColor", {
            get: function () {
                return new Color(this.foregroundPrototype.Name, this.foregroundPrototype.CssValue);
            },
            set: function (c) { this.foregroundPrototype = c; },
            enumerable: true,
            configurable: true
        });
        /**
         * Color prototypes
         */
        Color.backgroundPrototype = new Color("Dark gray", "#111");
        Color.foregroundPrototype = new Color("White", "#fff");
        return Color;
    })();
    UI.Color = Color;
})(UI || (UI = {}));
//# sourceMappingURL=Color.js.map