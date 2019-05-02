const querystring = require('querystring');
const fetch = require('node-fetch');

const DefaultHost = 'https://developer.api.autodesk.com';

async function _fetch(url, options) {
    const response = await fetch(url, options);
    const contentType = response.headers.get('Content-Type').split(';')[0];
    if (response.ok) {
        switch (contentType) {
            case 'application/json':
                const json = await response.json();
                return json;
            case 'application/xml':
            case 'text/plain':
                const text = await response.text();
                return text;
            default:
                const buff = await response.arrayBuffer();
                return buff;
        }
    } else {
        switch (contentType) {
            case 'application/json':
                const json = await response.json();
                throw new Error(json);
            default:
                const text = await response.text();
                throw new Error(text);
        }
    }
}

async function get(url, headers = {}) {
    const options = {
        method: 'GET',
        headers: headers
    };
    return _fetch(url, options);
}

async function post(url, data, headers = {}) {
    const options = {
        method: 'POST',
        headers: headers
    };
    if (data.urlencoded) {
        options.body = querystring.stringify(data.urlencoded);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (data.json) {
        options.body = JSON.stringify(data.json);
        headers['Content-Type'] = 'application/json';
    } else if (data.buffer) {
        options.body = data.buffer;
        headers['Content-Type'] = 'application/octet-stream';
    } else {
        throw new Error(`Content type not supported`);
    }
    headers['Content-Length'] = Buffer.byteLength(options.body);
    return _fetch(url, options);
}

async function put(url, data, headers = {}) {
    const options = {
        method: 'PUT',
        headers: headers
    };
    if (data.urlencoded) {
        options.body = querystring.stringify(data.urlencoded);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (data.json) {
        options.body = JSON.stringify(data.json);
        headers['Content-Type'] = 'application/json';
    } else if (data.buffer) {
        options.body = data.buffer;
        headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';
    } else {
        throw new Error(`Content type not supported`);
    }
    headers['Content-Length'] = Buffer.byteLength(options.body);
    return _fetch(url, options);
}

async function patch(url, data, headers = {}) {
    const options = {
        method: 'PATCH',
        headers: headers
    };
    if (data.urlencoded) {
        options.body = querystring.stringify(data.urlencoded);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (data.json) {
        options.body = JSON.stringify(data.json);
        headers['Content-Type'] = 'application/json';
    } else if (data.buffer) {
        options.body = data.buffer;
        headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';
    } else {
        throw new Error(`Content type not supported`);
    }
    headers['Content-Length'] = Buffer.byteLength(options.body);
    return _fetch(url, options);
}

class DesignAutomationURI {
    constructor(id) {
        const d = id.indexOf('.');
        const p = id.indexOf('+');
        this.owner = id.substr(0, d);
        if (p === -1) {
            this.name = id.substr(d + 1);
            this.alias = undefined;
        } else {
            this.name = id.substr(d + 1, p - d - 1);
            this.alias = id.substr(p + 1);
        }
    }

    toString() {
        return this.owner + '.' + this.name + (this.alias ? '+' + this.alias : '');
    }
}

module.exports = {
    DesignAutomationURI,
    DefaultHost,
    get,
    post,
    put,
    patch
};
