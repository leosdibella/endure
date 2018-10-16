const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nodeEnvironment = process.NODE_ENV ? process.NODE_ENV : 'development';
const devMode = nodeEnvironment !== 'production';

const exclusions = [
    '/dist',
    '/node_modules',
    '/server',
    '/config'
]

module.exports = {
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist'
    },
    devtool: 'source-map',
    resolve: {
        extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.json'
        ]
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
            exclude: exclusions
        }, {
            enforce: 'pre',
            test: /\.js$/,
            loader: 'source-map-loader',
            exclude: exclusions
        }, {
            test: /\.scss$/,
            use: [
                devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader'
            ],
            exclude: exclusions
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({ 
          template: './src/index.html', 
          filename: './index.html' 
        }),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
        })
    ]
};