/// <reference path="Log" />

module Helpers {
	
	export enum ErrorType {
		Warning,
		Fatal
	}
	
	export interface ILogFunction {
		(type: ErrorType, args: Array<any>): any;
	}
	
	/**
	 * A class for logging errors that happen within the application
	 */
	export class Errors {
		
		/** If the logging should be done or not. */
		private static doLog = true;
		
		public static TurnOn() : void { this.doLog = true; }
		public static TurnOff() : void { this.doLog = false; }
		
		/**
		 * Implmentation of the logging function
		 */
		private static LogFunction: ILogFunction = (type: ErrorType, args: Array<any>) => {
			// this is the basic logging function, it can be replaced by anything else...
			if(type === ErrorType.Fatal) {
				throw new Error(`Fatal Error: ${args.join("; ")}`)
			} else {
				Debug.Log(LogLevel.Normal, Errors.ErrorTypeName(type), args);
			}
		}
		
		/**
		 * Set different logging impementation
		 */
		public static SetLogFunction(f: ILogFunction) : void {
			this.LogFunction = f;
		}
		
		/**
		 * Report an error
		 */
		public static Report(type: ErrorType, ...args: Array<any>) : void {
			if(this.doLog) {
				this.LogFunction(type, args);
			}
		} 
		
		/**
		 * Convert error type to string
		 */
		private static ErrorTypeName(e: ErrorType) : string {
			switch(e) {
				case ErrorType.Warning:
					return "Warning";
				case ErrorType.Fatal:
					return "Fatal error";
				default:
					return "Unknown error type";					
			}
		}
		
	}
	
}