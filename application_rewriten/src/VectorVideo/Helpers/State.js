/// <reference path="Vector" />
/// <reference path="../UI/Color" />
/// <reference path="../UI/Brush" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Helpers;
(function (Helpers) {
    (function (StateType) {
        StateType[StateType["ChangeBrushSize"] = 0] = "ChangeBrushSize";
        StateType[StateType["ChangeColor"] = 1] = "ChangeColor";
        StateType[StateType["Cursor"] = 2] = "Cursor";
    })(Helpers.StateType || (Helpers.StateType = {}));
    var StateType = Helpers.StateType;
    var State = (function () {
        /**
         * @param   type    State type
         * @param   time    Time when this state should be processed
         */
        function State(type, time) {
            this.type = type;
            this.time = time;
        }
        /** Type of this state */
        State.prototype.GetType = function () { return this.type; };
        /** Time elapsed from video start in milliseconds */
        State.prototype.GetTime = function () { return this.time; };
        return State;
    })();
    Helpers.State = State;
    /**
     * Class representing state of app.
     */
    var CursorState = (function (_super) {
        __extends(CursorState, _super);
        function CursorState(time, x, y, pressure) {
            _super.call(this, StateType.Cursor, time);
            this.x = x;
            this.y = y;
            this.pressure = pressure;
        }
        Object.defineProperty(CursorState.prototype, "X", {
            /** Get pointing device X coordinate */
            get: function () { return this.x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CursorState.prototype, "Y", {
            /** Get pointing device Y coordinate */
            get: function () { return this.y; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CursorState.prototype, "Pressure", {
            /** Get pointing device pressure from 0 to 1 */
            get: function () { return this.pressure; },
            enumerable: true,
            configurable: true
        });
        /**
         * Get pointing device position as a vector
         */
        CursorState.prototype.getPosition = function () {
            return new Helpers.Vector2(this.x, this.y);
        };
        return CursorState;
    })(State);
    Helpers.CursorState = CursorState;
    /**
     * Class representing state of app.
     */
    var ColorState = (function (_super) {
        __extends(ColorState, _super);
        function ColorState(time, color) {
            _super.call(this, StateType.ChangeColor, time);
            this.color = color;
        }
        Object.defineProperty(ColorState.prototype, "Color", {
            get: function () { return this.color; },
            enumerable: true,
            configurable: true
        });
        return ColorState;
    })(State);
    Helpers.ColorState = ColorState;
    /**
     * Class representing state of app.
     */
    var SizeState = (function (_super) {
        __extends(SizeState, _super);
        function SizeState(time, size) {
            _super.call(this, StateType.ChangeBrushSize, time);
            this.size = size;
        }
        Object.defineProperty(SizeState.prototype, "Size", {
            get: function () { return this.size; },
            enumerable: true,
            configurable: true
        });
        return SizeState;
    })(State);
    Helpers.SizeState = SizeState;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=State.js.map