const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './dist/index.js',
    output: {
        filename: 'forge-server-utils.js',
        path: path.resolve(__dirname, 'dist', 'browser'),
        library: 'forge'
    },
    plugins: [
        new NodePolyfillPlugin()
    ],
    devtool: 'source-map'
};
