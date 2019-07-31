const path = require('path');

module.exports = {
    mode: 'production',
    entry: './dist/index.js',
    output: {
        filename: 'forge-server-utils.js',
        path: path.resolve(__dirname, 'dist', 'browser'),
        library: 'forge'
    },
    devtool: 'source-map'
};
