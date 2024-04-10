const path = require('path');

module.exports = {
    mode: 'production',
    entry: './dist/index.js',
    output: {
        filename: 'aps-sdk-node.js',
        path: path.resolve(__dirname, 'dist', 'browser'),
        library: 'APS'
    },
    devtool: 'source-map'
};
