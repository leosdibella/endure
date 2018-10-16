const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const optimizationConfig = require('./webpack.optimization.config');

const productionConfiguration = function (env) {
    const nodeEnvironment = env.NODE_ENV ? env.NODE_ENV : 'development';

    return {
        plugins: [
            new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(nodeEnvironment) }),
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css',
                chunkFilename: '[id].[hash].css'
            })
        ]
    };
};

module.exports = merge.smart(baseConfig, optimizationConfig, productionConfiguration);