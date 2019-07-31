const path = require('path');

module.exports = {
    mode: 'development',
    entry: './dist/index.js',
    output: {
        filename: 'forge-server-utils.js',
        path: path.resolve(__dirname, 'dist', 'browser'),
        library: 'forge'
    }
};
