/// <reference path="Mouse.ts" />
/// <reference path="../Helpers/HTML.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VideoData;
(function (VideoData) {
    /**
     * Pointer type
     * see http://www.wacomeng.com/web/WebPluginReleaseNotes.htm#Group_x0020_77
     */
    var WacomPointerType;
    (function (WacomPointerType) {
        WacomPointerType[WacomPointerType["OutOfProximity"] = 0] = "OutOfProximity";
        WacomPointerType[WacomPointerType["Pen"] = 1] = "Pen";
        WacomPointerType[WacomPointerType["Mouse"] = 2] = "Mouse";
        WacomPointerType[WacomPointerType["Eraseer"] = 3] = "Eraseer";
    })(WacomPointerType || (WacomPointerType = {}));
    /**
     * Wacom tablets can be used to enhance the recording with their ability to detect pen pressure
     * for variable thickness of drawn lines.
     */
    var WacomTablet = (function (_super) {
        __extends(WacomTablet, _super);
        function WacomTablet(board, penApi) {
            _super.call(this, board); // obligatory parent constructor call
            this.penApi = penApi;
        }
        /**
         * Current level of pressure. When the mouse is outside of the canvas, then it is automaticaly zero.
         * @return {number}	The pressure from 0.0 to 1.0
         */
        WacomTablet.prototype.GetPressure = function () {
            if (this.penApi && this.penApi.pointerType == WacomPointerType.Pen) {
                return this.isInside === true ? this.penApi.pressure : 0; // pressure is from 0.0 (no pressure) to 1.0 (max pressure)
            }
        };
        /**
         * Is Wacom API available on this computer and this browser?
         */
        WacomTablet.IsAvailable = function () {
            // create the plugin according to the documentation
            var plugin = Helpers.HTML.CreateElement("object", { type: "application/x-wacomtabletplugin" });
            plugin.style.display = "none";
            document.body.appendChild(plugin);
            // does the plugin work?
            if (!!plugin.version === true) {
                console.log("Wacom tablet is connected and plugin installed. Plugin version is " + plugin.version + ".");
                return plugin.penAPI;
            }
            return null;
        };
        return WacomTablet;
    })(VideoData.Mouse);
    VideoData.WacomTablet = WacomTablet;
})(VideoData || (VideoData = {}));
