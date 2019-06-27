import * as querystring from 'querystring';
import fetch, { RequestInit, Response } from 'node-fetch';

import { AuthenticationClient } from './authentication';

const RetryDelay = 5000; // Delay (in milliseconds) before retrying after a "202 Accepted" response
function sleep(ms: number) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }

export const DefaultHost = 'https://developer.api.autodesk.com';

export enum Region {
    US = 'US',
    EMEA = 'EMEA'
}

export type IAuthOptions = { client_id: string; client_secret: string; } | { token: string; };

export type IRequestData = { urlencoded: any; } | { json: any; } | { buffer: any; };

export abstract class ForgeClient {
    protected auth?: AuthenticationClient;
    protected token?: string;
    protected root: string;
    protected host: string;
    protected region: Region;

    /**
     * Initializes new client with specific authentication method.
     * @param {string} root Root path for all endpoints.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region ("US" or "EMEA").
     */
    constructor(root: string, auth: IAuthOptions, host?: string, region?: Region) {
        if ('client_id' in auth && 'client_secret' in auth) {
            this.auth = new AuthenticationClient(auth.client_id, auth.client_secret, host);
        } else if ('token' in auth) {
            this.token = auth.token;
        } else {
            throw new Error('Authentication parameters missing or incorrect.');
        }
        this.root = root;
        this.host = host || DefaultHost;
        this.region = region || Region.US;
    }

    /**
     * Resets client to specific authentication method, Forge host, and availability region.
     * @param {IAuthOptions} [auth] Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region ("US" or "EMEA").
     */
    public reset(auth?: IAuthOptions, host?: string, region?: Region) {
        if (typeof auth !== 'undefined') {
            if ('client_id' in auth && 'client_secret' in auth) {
                this.auth = new AuthenticationClient(auth.client_id, auth.client_secret, host);
            } else if ('token' in auth) {
                this.token = auth.token;
            } else {
                throw new Error('Authentication parameters missing or incorrect.');
            }
        }
        if (typeof host !== 'undefined') {
            this.host = host || DefaultHost;
        }
        if (typeof region !== 'undefined') {
            this.region = region || Region.US;
        }
    }

    protected async setAuthorization(options: any, scopes: string[]) {
        options.headers = options.headers || {};
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            options.headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            options.headers['Authorization'] = 'Bearer ' + this.token;
        }        
    }

    protected setPayload(options: any, payload: any) {
        if (payload.urlencoded) {
            options.body = querystring.stringify(payload.urlencoded);
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (payload.json) {
            options.body = JSON.stringify(payload.json);
            options.headers['Content-Type'] = 'application/json';
        } else if (payload.buffer) {
            options.body = payload.buffer;
            options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/octet-stream';
        } else {
            throw new Error(`Content type not supported`);
        }
        options.headers['Content-Length'] = Buffer.byteLength(<any>options.body).toString();
    }

    protected async parseResponse(response: Response) {
        const contentTypeHeader = response.headers.get('Content-Type') || '';
        const contentType = contentTypeHeader.split(';')[0];
        if (response.ok) {
            switch (contentType) {
                case 'application/json':
                case 'application/vnd.api+json':
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
                    throw new ForgeError(response.url, response.status, response.statusText, data);
                default:
                    const text = await response.text();
                    throw new ForgeError(response.url, response.status, response.statusText, text);
            }
        }
    }

    protected async fetch(endpoint: string, options: RequestInit) {
        return fetch(this.host + this.root + endpoint, options);
    }

    // Helper method for GET requests
    protected async get(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[], repeatOn202: boolean = false) {
        const options: RequestInit = { method: 'GET', headers };
        await this.setAuthorization(options, scopes);
        let resp = await this.fetch(endpoint, options);
        while (resp.status === 202 && repeatOn202) {
            sleep(RetryDelay);
            resp = await this.fetch(endpoint, options);
        }
        return this.parseResponse(resp);
    }

    // Helper method for POST requests
    protected async post(endpoint: string, data: IRequestData, headers: { [name: string]: string } = {}, scopes: string[]) {
        const options: RequestInit = { method: 'POST', headers };
        this.setPayload(options, data);
        await this.setAuthorization(options, scopes);
        const resp = await this.fetch(endpoint, options);
        return this.parseResponse(resp);
    }

    // Helper method for PUT requests
    protected async put(endpoint: string, data: IRequestData, headers: { [name: string]: string } = {}, scopes: string[]) {
        const options: RequestInit = { method: 'PUT', headers };
        this.setPayload(options, data);
        await this.setAuthorization(options, scopes);
        const resp = await this.fetch(endpoint, options);
        return this.parseResponse(resp);
    }

    // Helper method for PATCH requests
    protected async patch(endpoint: string, data: IRequestData, headers: { [name: string]: string } = {}, scopes: string[]) {
        const options: RequestInit = { method: 'PATCH', headers };
        this.setPayload(options, data);
        await this.setAuthorization(options, scopes);
        const resp = await this.fetch(endpoint, options);
        return this.parseResponse(resp);
    }

    // Helper method for DELETE requests
    protected async delete(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[]) {
        const options: RequestInit = { method: 'DELETE', headers };
        await this.setAuthorization(options, scopes);
        const resp = await this.fetch(endpoint, options);
        return this.parseResponse(resp);
    }
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
