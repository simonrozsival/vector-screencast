var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Vector_1 = require('./Vector');
(function (StateType) {
    StateType[StateType["ChangeBrushSize"] = 0] = "ChangeBrushSize";
    StateType[StateType["ChangeColor"] = 1] = "ChangeColor";
    StateType[StateType["Cursor"] = 2] = "Cursor";
})(exports.StateType || (exports.StateType = {}));
var StateType = exports.StateType;
var State = (function () {
    function State(type, time) {
        this.type = type;
        this.time = time;
    }
    State.prototype.GetType = function () { return this.type; };
    State.prototype.GetTime = function () { return this.time; };
    return State;
})();
exports.State = State;
var CursorState = (function (_super) {
    __extends(CursorState, _super);
    function CursorState(time, x, y, pressure) {
        _super.call(this, StateType.Cursor, time);
        this.x = x;
        this.y = y;
        this.pressure = pressure;
    }
    Object.defineProperty(CursorState.prototype, "X", {
        get: function () { return this.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CursorState.prototype, "Y", {
        get: function () { return this.y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CursorState.prototype, "Pressure", {
        get: function () { return this.pressure; },
        enumerable: true,
        configurable: true
    });
    CursorState.prototype.getPosition = function () {
        return new Vector_1.default(this.x, this.y);
    };
    return CursorState;
})(State);
exports.CursorState = CursorState;
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
exports.ColorState = ColorState;
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
exports.SizeState = SizeState;
