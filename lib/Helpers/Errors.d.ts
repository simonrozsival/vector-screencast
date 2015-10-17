export declare enum ErrorType {
    Warning = 0,
    Fatal = 1,
}
export interface ILogFunction {
    (type: ErrorType, args: Array<any>): any;
}
export default class Errors {
    private static doLog;
    static TurnOn(): void;
    static TurnOff(): void;
    private static LogFunction;
    static SetLogFunction(f: ILogFunction): void;
    static Report(type: ErrorType, ...args: Array<any>): void;
    private static ErrorTypeName(e);
}
