import * as querystring from 'querystring';
import fetch, { RequestInit } from 'node-fetch';

export const DefaultHost = 'https://developer.api.autodesk.com';

const RetryDelay = 5000; // Delay (in milliseconds) before retrying after a "202 Accepted" response

export enum Region {
    US = 'US',
    EMEA = 'EMEA'
}

class ForgeError extends Error {
    private url: string;
    private status: number;
    private statusText: string;
    private data: any;

    constructor(url: string, status: number, statusText: string, data: any) {
        super();
        this.url = url;
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        if (data) {
            this.message = url + ': ' + (typeof data === 'string') ? data : JSON.stringify(data);
        } else {
            this.message = url + ': ' + statusText;
        }
    }
}

function sleep(ms: number) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }

async function _fetch(url: string, options: RequestInit) {
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
                throw new ForgeError(url, response.status, response.statusText, data);
            default:
                const text = await response.text();
                throw new ForgeError(url, response.status, response.statusText, text);
        }
    }
}

export async function rawFetch(url: string, options: RequestInit) {
    return fetch(url, options);
}

export async function get(url: string, headers: { [name: string]: string } = {}) {
    const options = {
        method: 'GET',
        headers: headers
    };
    return _fetch(url, options);
}

export async function post(url: string, data: any, headers: { [name: string]: string } = {}) {
    const options: RequestInit = {
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
    headers['Content-Length'] = Buffer.byteLength(<any>options.body).toString();
    return _fetch(url, options);
}

export async function put(url: string, data: any, headers: { [name: string]: string } = {}) {
    const options: RequestInit = {
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
    headers['Content-Length'] = Buffer.byteLength(<any>options.body).toString();
    return _fetch(url, options);
}

export async function patch(url: string, data: any, headers: { [name: string]: string } = {}) {
    const options: RequestInit = {
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
    headers['Content-Length'] = Buffer.byteLength(<any>options.body).toString();
    return _fetch(url, options);
}

export async function del(url: string, headers: { [name: string]: string } = {}) {
    const options: RequestInit = {
        method: 'DELETE',
        headers: headers
    };
    return _fetch(url, options);
}
