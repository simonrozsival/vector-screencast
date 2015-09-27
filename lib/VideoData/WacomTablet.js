var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Mouse_1 = require('./Mouse');
var HTML_1 = require('../Helpers/HTML');
var WacomPointerType;
(function (WacomPointerType) {
    WacomPointerType[WacomPointerType["OutOfProximity"] = 0] = "OutOfProximity";
    WacomPointerType[WacomPointerType["Pen"] = 1] = "Pen";
    WacomPointerType[WacomPointerType["Mouse"] = 2] = "Mouse";
    WacomPointerType[WacomPointerType["Eraseer"] = 3] = "Eraseer";
})(WacomPointerType || (WacomPointerType = {}));
var WacomTablet = (function (_super) {
    __extends(WacomTablet, _super);
    function WacomTablet(events, board, timer, penApi) {
        _super.call(this, events, board, timer);
        this.penApi = penApi;
    }
    WacomTablet.Factory = function (api) {
        return function (events, board, timer) { return new WacomTablet(events, board, timer, api); };
    };
    WacomTablet.prototype.GetPressure = function () {
        if (this.isDown === false || this.isInside === false) {
            return 0;
        }
        if (this.penApi && this.penApi.pointerType == WacomPointerType.Pen) {
            return this.isInside === true ? this.penApi.pressure : 0;
        }
        else {
            return _super.prototype.GetPressure.call(this);
        }
    };
    WacomTablet.IsAvailable = function () {
        var plugin = HTML_1.default.CreateElement("object", { type: "application/x-wacomtabletplugin" });
        document.body.appendChild(plugin);
        if (!!plugin.version === true) {
            console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
            return plugin.penAPI;
        }
        return null;
    };
    return WacomTablet;
})(Mouse_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WacomTablet;
