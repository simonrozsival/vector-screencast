/* global __dirname */
var path = require("path");
var webpack = require("webpack");
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin({
	filename: "common.js",
	chunks: [ "player", "recorder" ]
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');
  
module.exports = {
	entry: {
		player: path.resolve(__dirname, "./src/lib/Player.ts"),
		recorder: path.resolve(__dirname, "./src/lib/Recorder.ts"),
		style: path.resolve(__dirname, "./src/theme/theme.less"),
		"recording-worker": path.resolve(__dirname, "./src/workers/RecordingWorker.ts")		
	},	
	output: {
		path: path.resolve(__dirname, "./release/"),
		filename: "[name].js"
	},
	devtool: "source-map",	
	resolve: {
		extensions: [ "", ".ts" ]
	},	
	module: {
		loaders: [
			{ 
				test: /\.ts$/,
				loaders: [ "ts" ],
				exclude: [
					/node_modules/,
					/test/,
					/typings/
				]
			},
			{
				test: /.less$/,
				loader: ExtractTextPlugin.extract("css?sourceMap!less?sourceMap")
			},
			// web fonts:
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: "url?limit=10000&minetype=application/font-woff"
			},
      		{ 
				test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: "file"
			}
		]
	},	
	plugins: [ commonsPlugin, new ExtractTextPlugin('style.css') ]
};