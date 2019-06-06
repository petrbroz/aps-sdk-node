const querystring = require('querystring');
const fetch = require('node-fetch');

const DefaultHost = 'https://developer.api.autodesk.com';
const RetryDelay = 5000; // Delay (in milliseconds) before retrying after a "202 Accepted" response

class ForgeError extends Error {
    constructor(url, status, data) {
        super(JSON.stringify(data));
        this.url = url;
        this.status = status;
        this.data = data;
    }
}

function sleep(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }

async function _fetch(url, options) {
    let response = await fetch(url, options);
    while (response.status === 202) {
        sleep(RetryDelay);
        response = await fetch(url, options)
    }
    const contentTypeHeader = response.headers.get('Content-Type') || '';
    const contentType = contentTypeHeader.split(';')[0];
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
                const data = await response.json();
                throw new ForgeError(url, response.status, data);
            default:
                const text = await response.text();
                throw new Error(text);
        }
    }
}

async function rawFetch(url, options) {
    return fetch(url, options);
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

/** @deprecated Use {@link DesgnAutomationID} instead. */
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
    patch,
    ForgeError,
    rawFetch
};
