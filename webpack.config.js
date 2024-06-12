const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './dist/index.js',
    output: {
        filename: 'aps-sdk-node.js',
        path: path.resolve(__dirname, 'dist', 'browser'),
        library: 'APS'
    },
    plugins: [
        new NodePolyfillPlugin()
    ],
    devtool: 'source-map'
};
