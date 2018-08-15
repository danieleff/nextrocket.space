//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: "./client/index.tsx",
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
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { importLoaders: 1 } }
                ]
            }
        ]
    },
    mode: "production",
    optimization: {
        minimize: true
    },
    plugins: [
        //new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(['public/js']),
        new HtmlWebpackPlugin({
            template: "client/index.html",
            output: "public/index.html"
        })
    ]
};
