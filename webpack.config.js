var path = require("path");
var webpack = require("webpack");
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
  
module.exports = {
	entry: {
		//lib: path.join(__dirname, "./src/VectorScreencast/vector-screencast.ts"),
		player: path.join(__dirname, "./src/VectorScreencast/Player.ts"),
		recorder: path.join(__dirname, "./src/VectorScreencast/Recorder.ts")
	},	
	output: {
		path: path.join(__dirname, "./release/"),
		filename: "[name].js"
	},
	devtool: "source-map",	
	resolve: {
		extensions: [ "", ".ts" ]
	},	
	module: {
		loaders: [
			{ 
				test: /.ts$/,
				loaders: [ "uglify", "babel", "ts" ]				
			}		
		]
	},	
	plugins: [ commonsPlugin ]
};