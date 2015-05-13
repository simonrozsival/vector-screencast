
module Helpers {
	
	export enum LogLevel {
		Silent = 0,
		Normal = 1,		
		Verbose = 2,
		Annoying = 3
	}
	
	/**
	 * Debug class wraps the console.log function.
	 * Only some messages should be logged according to user's choice.
	 */
	export class Debug {	
		
		/** Current logging level - default is Normal */
		private static level: LogLevel = LogLevel.Normal;
		
		/**
		 * Change current logging level
		 */
		public static SetLevel(level: LogLevel) : void {
			this.level = level;
		} 
		
		/**
		 * Log data only if the logging level is lesser
		 */
		public static Log(level: LogLevel, ...data: Array<any>) {
			if(level <= this.level) {
				console.log(data);
			}
		}
		
	} 
	
} 