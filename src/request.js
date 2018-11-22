const https = require('https');
const querystring = require('querystring');

const DefaultHost = 'developer.api.autodesk.com';

function request(options, body, json) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(json ? JSON.parse(data) : data);
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

function get(path, headers = {}, json = true, host = DefaultHost) {
    return request({ method: 'GET', host, path, headers }, null, json);
}

function post(path, data, headers = {}, json = true, host = DefaultHost) {
    let body = null;
    if (data.urlencoded) {
        body = querystring.stringify(data.urlencoded);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (data.json) {
        body = JSON.stringify(data.json);
        headers['Content-Type'] = 'application/json';
    } else {
        throw new Error(`Content type not supported`);
    }

    headers['Content-Length'] = Buffer.byteLength(body);
    return request({ method: 'POST', host, path, headers }, body, json);
}

function put(path, data, headers = {}, json = true, host = DefaultHost) {
    headers['Content-Length'] = Buffer.byteLength(data);
    return request({ method: 'PUT', host, path, headers }, data, json);
}

module.exports = {
    get,
    post,
    put
};