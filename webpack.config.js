const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: "./ts/index.tsx",
    output: {
        path: __dirname + "/public",
        filename: "js/bundle.[name].[chunkhash:8].min.js",
        libraryTarget: 'var',
        library: 'app'
    },
    devtool: 'source-map',
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { 
                test: /\.tsx?$/, 
                loader: "ts-loader"
            }
        ]
    },
    mode: "production",
    optimization: {
        minimize: true
    },
    plugins: [
        new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(['public/js']),
        new HtmlWebpackPlugin({
            template: "public/index-before-bundle.html",
            output: "public/index.html"
        })
    ]
};
