/// <reference path="Log" />
var Helpers;
(function (Helpers) {
    (function (ErrorType) {
        ErrorType[ErrorType["Warning"] = 0] = "Warning";
        ErrorType[ErrorType["Fatal"] = 1] = "Fatal";
    })(Helpers.ErrorType || (Helpers.ErrorType = {}));
    var ErrorType = Helpers.ErrorType;
    /**
     * A class for logging errors that happen within the application
     */
    var Errors = (function () {
        function Errors() {
        }
        Errors.TurnOn = function () { this.doLog = true; };
        Errors.TurnOff = function () { this.doLog = false; };
        /**
         * Set different logging impementation
         */
        Errors.SetLogFunction = function (f) {
            this.LogFunction = f;
        };
        /**
         * Report an error
         */
        Errors.Report = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.doLog) {
                this.LogFunction(type, args);
            }
        };
        /**
         * Convert error type to string
         */
        Errors.ErrorTypeName = function (e) {
            switch (e) {
                case ErrorType.Warning:
                    return "Warning";
                case ErrorType.Fatal:
                    return "Fatal error";
                default:
                    return "Unknown error type";
            }
        };
        /** If the logging should be done or not. */
        Errors.doLog = true;
        /**
         * Implmentation of the logging function
         */
        Errors.LogFunction = function (type, args) {
            // this is the basic logging function, it can be replaced by anything else...
            if (type === ErrorType.Fatal) {
                throw new Error("Fatal Error: " + args.join("; "));
            }
            else {
                Helpers.Debug.Log(Helpers.LogLevel.Normal, Errors.ErrorTypeName(type), args);
            }
        };
        return Errors;
    })();
    Helpers.Errors = Errors;
})(Helpers || (Helpers = {}));
