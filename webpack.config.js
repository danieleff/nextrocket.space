const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: "./client/index.tsx",
    output: {
        path: __dirname + "/public",
        filename: "static/bundle.[name].[chunkhash:8].min.js",
        library: { name: 'app', type: 'var' },
        // Only wipe generated files; public/images is checked in.
        clean: { keep: /^images[\\/]/ },
    },
    devtool: 'source-map',
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            }
        ]
    },
    mode: "production",
    optimization: {
        minimize: true,
        // index.html has {{placeholders}} inside <script> that the server fills in,
        // so it must not be minified as JS/HTML.
        minimizeOptions: { html: false },
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "static/styles.[contenthash:8].css" }),
        new HtmlWebpackPlugin({
            template: "client/index.html",
            filename: "index.html",
            inject: "body",
            scriptLoading: "blocking",
            minify: false,
        })
    ]
};
