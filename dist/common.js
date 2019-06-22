"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = __importStar(require("querystring"));
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.DefaultHost = 'https://developer.api.autodesk.com';
const RetryDelay = 5000; // Delay (in milliseconds) before retrying after a "202 Accepted" response
class ForgeError extends Error {
    constructor(url, status, statusText, data) {
        super();
        this.url = url;
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        if (data) {
            this.message = url + ': ' + (typeof data === 'string') ? data : JSON.stringify(data);
        }
        else {
            this.message = url + ': ' + statusText;
        }
    }
}
function sleep(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
async function _fetch(url, options) {
    let response = await node_fetch_1.default(url, options);
    while (response.status === 202) {
        sleep(RetryDelay);
        response = await node_fetch_1.default(url, options);
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
    }
    else {
        switch (contentType) {
            case 'application/json':
                const data = await response.json();
                throw new ForgeError(url, response.status, response.statusText, data);
            default:
                const text = await response.text();
                throw new ForgeError(url, response.status, response.statusText, text);
        }
    }
}
async function rawFetch(url, options) {
    return node_fetch_1.default(url, options);
}
exports.rawFetch = rawFetch;
async function get(url, headers = {}) {
    const options = {
        method: 'GET',
        headers: headers
    };
    return _fetch(url, options);
}
exports.get = get;
async function post(url, data, headers = {}) {
    const options = {
        method: 'POST',
        headers: headers
    };
    if (data.urlencoded) {
        options.body = querystring.stringify(data.urlencoded);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    else if (data.json) {
        options.body = JSON.stringify(data.json);
        headers['Content-Type'] = 'application/json';
    }
    else if (data.buffer) {
        options.body = data.buffer;
        headers['Content-Type'] = 'application/octet-stream';
    }
    else {
        throw new Error(`Content type not supported`);
    }
    headers['Content-Length'] = Buffer.byteLength(options.body).toString();
    return _fetch(url, options);
}
exports.post = post;
async function put(url, data, headers = {}) {
    const options = {
        method: 'PUT',
        headers: headers
    };
    if (data.urlencoded) {
        options.body = querystring.stringify(data.urlencoded);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    else if (data.json) {
        options.body = JSON.stringify(data.json);
        headers['Content-Type'] = 'application/json';
    }
    else if (data.buffer) {
        options.body = data.buffer;
        headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';
    }
    else {
        throw new Error(`Content type not supported`);
    }
    headers['Content-Length'] = Buffer.byteLength(options.body).toString();
    return _fetch(url, options);
}
exports.put = put;
async function patch(url, data, headers = {}) {
    const options = {
        method: 'PATCH',
        headers: headers
    };
    if (data.urlencoded) {
        options.body = querystring.stringify(data.urlencoded);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    else if (data.json) {
        options.body = JSON.stringify(data.json);
        headers['Content-Type'] = 'application/json';
    }
    else if (data.buffer) {
        options.body = data.buffer;
        headers['Content-Type'] = headers['Content-Type'] || 'application/octet-stream';
    }
    else {
        throw new Error(`Content type not supported`);
    }
    headers['Content-Length'] = Buffer.byteLength(options.body).toString();
    return _fetch(url, options);
}
exports.patch = patch;
