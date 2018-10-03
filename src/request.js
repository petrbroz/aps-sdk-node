const https = require('https');
const querystring = require('querystring');

const FORGE_HOST = 'developer.api.autodesk.com';

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', (err) => reject(err));
        });
        req.on('error', (err) => reject(err));
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

function get(path, headers) {
    return request({
        method: 'GET',
        host: FORGE_HOST,
        path,
        headers
    });
}

function post(path, data) {
    const body = querystring.stringify(data);
    return request({
        method: 'POST',
        host: FORGE_HOST,
        path,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body)
        }
    }, body);
}

module.exports = {
    get,
    post
};