const https = require('https');
const querystring = require('querystring');

const FORGE_HOST = 'developer.api.autodesk.com';

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(data); // reject(JSON.parse(data));
                }
            });
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
    let body = null;
    let type = null;
    if (data.urlencoded) {
        body = querystring.stringify(data.urlencoded);
        type = 'application/x-www-form-urlencoded';
    } else if (data.json) {
        body = JSON.stringify(data.json);
        type = 'application/json';
    } else {
        throw new Error(`Content type not supported`);
    }

    return request({
        method: 'POST',
        host: FORGE_HOST,
        path,
        headers: {
            'Content-Type': type,
            'Content-Length': Buffer.byteLength(body)
        }
    }, body);
}

module.exports = {
    get,
    post
};