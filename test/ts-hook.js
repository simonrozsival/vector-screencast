/**
 * Configure the ts-node 'compiler' to remove warnings, when compilation fails. 
 */ 

require("ts-node").register({
	disableWarnings: true
});