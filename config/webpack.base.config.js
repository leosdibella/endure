const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nodeEnvironment = process.NODE_ENV ? process.NODE_ENV : 'development';
const developmentMode = nodeEnvironment !== 'production';

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
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            loader: 'file-loader'
        }, {
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
                developmentMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader',
                {
                    loader: 'sass-resources-loader',
                    options: {
                      resources: './src/styles/global.scss'
                    }
                }
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
            filename: developmentMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: developmentMode ? '[id].css' : '[id].[hash].css'
        })
    ]
};