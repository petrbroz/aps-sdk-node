const path = require('path');

module.exports = {
    mode: 'development',
    entry: './dist/index.js',
    output: {
        filename: 'forge-utils.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'forge'
    }
};
