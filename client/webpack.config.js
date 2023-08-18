const path = require('path');


module.exports = {
	mode: 'development',
	entry: {
		// 'service-worker': './compiled/service-worker.js',
		// 'content': './compiled/content.js',
		'service-worker': './src/service-worker.ts',
		'content': './src/content.tsx',
	},
	devtool: 'inline-source-map',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		// modules: [__dirname, "src", "node_modules"],
		extensions: ['.tsx', '.ts', 'js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: '/node_modules/'
			},
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader",
				],
			},
		],
	},
};