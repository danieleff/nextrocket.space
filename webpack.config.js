var webpack = require('webpack');

module.exports = {
    entry: "./ts/script.ts",
    output: {
        path: __dirname + "/js",
        filename: "bundle.min.js",
        libraryTarget: 'var',
        library: 'app'
    },
    devtool: 'source-map',
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
          include: /\.min\.js$/,
          minimize: true,
          sourceMap: true
        })
      ]
};
