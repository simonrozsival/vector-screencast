//namespace VectorScreencast.Helpers {
(function (ErrorType) {
    ErrorType[ErrorType["Warning"] = 0] = "Warning";
    ErrorType[ErrorType["Fatal"] = 1] = "Fatal";
})(exports.ErrorType || (exports.ErrorType = {}));
var ErrorType = exports.ErrorType;
var Errors = (function () {
    function Errors() {
    }
    Errors.TurnOn = function () { this.doLog = true; };
    Errors.TurnOff = function () { this.doLog = false; };
    Errors.SetLogFunction = function (f) {
        this.LogFunction = f;
    };
    Errors.Report = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.doLog) {
            this.LogFunction(type, args);
        }
    };
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
    Errors.doLog = true;
    Errors.LogFunction = function (type, args) {
        if (type === ErrorType.Fatal) {
            throw new Error("Fatal Error: " + args.join("; "));
        }
        else {
            console.log(Errors.ErrorTypeName(type), args);
        }
    };
    return Errors;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Errors;
