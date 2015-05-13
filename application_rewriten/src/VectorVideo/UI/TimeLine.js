/// <references path="BasicElements" />
/// <references path="../Helpers/VideoEvents" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var TimeLine = (function (_super) {
        __extends(TimeLine, _super);
        function TimeLine(id) {
            _super.call(this, "div", id);
            this.length = 0;
            // create progress bar
            var bar = new UI.SimpleElement("div");
            bar.GetHTML().classList.add("ui-progressbar");
            this.progresbar = bar;
            this.AddChild(bar);
            // init progresbar with
            this.Sync(0);
            // change video position, when the bar is clicked
            this.GetHTML().onclick = this.OnClick;
            // @todo show preloaded content
        }
        Object.defineProperty(TimeLine.prototype, "Length", {
            set: function (length) { this.length = length; },
            enumerable: true,
            configurable: true
        });
        /**
         * Skip to given moment after user clicks on the timeline
         */
        TimeLine.prototype.OnClick = function (e) {
            var time = (e.clientX - this.GetHTML().clientLeft) / this.GetHTML().clientWidth * this.length;
            this.SkipTo(time);
        };
        /**
         * Synchronize progress bar width with current time
         */
        TimeLine.prototype.Sync = function (time) {
            this.progresbar.GetHTML().style.width = this.length > 0 ? "" + time / this.length * 100 : "O%";
        };
        /**
         * @param	time	Time in milliseconds
         */
        TimeLine.prototype.SkipTo = function (time) {
            // triger an event...			
            VideoEvents.trigger(VideoEventType.JumpTo, time / this.length);
            // sync self
            this.Sync(time);
        };
        return TimeLine;
    })(UI.Panel);
    UI.TimeLine = TimeLine;
})(UI || (UI = {}));
//# sourceMappingURL=TimeLine.js.map