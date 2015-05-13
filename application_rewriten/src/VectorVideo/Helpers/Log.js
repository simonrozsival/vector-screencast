var Helpers;
(function (Helpers) {
    (function (LogLevel) {
        LogLevel[LogLevel["Silent"] = 0] = "Silent";
        LogLevel[LogLevel["Normal"] = 1] = "Normal";
        LogLevel[LogLevel["Verbose"] = 2] = "Verbose";
        LogLevel[LogLevel["Annoying"] = 3] = "Annoying";
    })(Helpers.LogLevel || (Helpers.LogLevel = {}));
    var LogLevel = Helpers.LogLevel;
    /**
     * Debug class wraps the console.log function.
     * Only some messages should be logged according to user's choice.
     */
    var Debug = (function () {
        function Debug() {
        }
        /**
         * Change current logging level
         */
        Debug.SetLevel = function (level) {
            this.level = level;
        };
        /**
         * Log data only if the logging level is lesser
         */
        Debug.Log = function (level) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            if (level <= this.level) {
                console.log(data);
            }
        };
        /** Current logging level - default is Normal */
        Debug.level = LogLevel.Normal;
        return Debug;
    })();
    Helpers.Debug = Debug;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=Log.js.map