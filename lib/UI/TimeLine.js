var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VideoEvents_1 = require('../Helpers/VideoEvents');
var BasicElements_1 = require('./BasicElements');
var HelperFunctions_1 = require('../Helpers/HelperFunctions');
var TimeLine = (function (_super) {
    __extends(TimeLine, _super);
    function TimeLine(id, events) {
        var _this = this;
        _super.call(this, "div", id);
        this.events = events;
        this.length = 0;
        this.GetHTML().classList.add("ui-progressbar");
        var bar = new BasicElements_1.Panel("div");
        bar.AddClass("ui-progress");
        bar.AddChild(new BasicElements_1.SimpleElement("div").AddClass("ui-current-time"));
        this.progresbar = bar;
        this.AddChild(bar);
        bar = null;
        var buffer = new BasicElements_1.SimpleElement("div");
        buffer.AddClass("ui-buffer");
        this.bufferbar = buffer;
        this.AddChild(buffer);
        buffer = null;
        this.arrow = new BasicElements_1.SimpleElement("div", "0:00");
        this.arrow.AddClass("ui-arrow");
        this.AddChild(this.arrow);
        this.Sync(0);
        this.GetHTML().onclick = function (e) { return _this.OnClick(e); };
        this.GetHTML().onmousemove = function (e) { return _this.OnMouseMove(e); };
    }
    Object.defineProperty(TimeLine.prototype, "Length", {
        set: function (length) { this.length = length; },
        enumerable: true,
        configurable: true
    });
    TimeLine.prototype.OnClick = function (e) {
        var time = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth * this.length;
        this.SkipTo(time);
    };
    TimeLine.prototype.OnMouseMove = function (e) {
        var progress = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth;
        var time = HelperFunctions_1.millisecondsToString(progress * this.length);
        this.arrow.GetHTML().textContent = time;
        this.arrow.GetHTML().style.left = progress * 100 + "%";
        var rect = this.arrow.GetHTML().getBoundingClientRect();
        if (rect.left < 0) {
            this.arrow.GetHTML().style.left = rect.width / 2 + "px";
        }
        else if (rect.right > this.GetHTML().getBoundingClientRect().right) {
            this.arrow.GetHTML().style.left = (this.GetHTML().getBoundingClientRect().right - (rect.width / 2)) + "px";
        }
    };
    TimeLine.prototype.Sync = function (time) {
        this.progresbar.GetHTML().style.width = this.length > 0 ? time / this.length * 100 + "%" : "O%";
    };
    TimeLine.prototype.SetBuffer = function (time) {
        this.bufferbar.GetHTML().style.width = this.length > 0 ? time / this.length * 100 + "%" : "O%";
    };
    TimeLine.prototype.SkipTo = function (time) {
        this.events.trigger(VideoEvents_1.VideoEventType.JumpTo, time / this.length);
        this.Sync(time);
    };
    return TimeLine;
})(BasicElements_1.Panel);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TimeLine;
