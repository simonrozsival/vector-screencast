

module.exports = {
	
	entry: "./src/Player.ts",
	output: {
		path: __dirname + "/js",
		filename: "bundle.js"
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
			}
		]
	}
		
}