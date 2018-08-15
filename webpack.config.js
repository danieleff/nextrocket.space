//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: "./client/index.tsx",
    output: {
        path: __dirname + "/public",
        filename: "static/bundle.[name].[chunkhash:8].min.js",
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
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    },
    mode: "production",
    optimization: {
        minimize: true
    },
    plugins: [
        //new BundleAnalyzerPlugin(),
        new ExtractTextPlugin("static/styles.[hash:8].css"),
        new CleanWebpackPlugin(['public/static']),
        new HtmlWebpackPlugin({
            template: "client/index.html",
            output: "public/index.html"
        })
    ]
};
