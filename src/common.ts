import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

import { AuthenticationClient } from './authentication';

const RetryDelay = 5000; // Delay (in milliseconds) before retrying after a "202 Accepted" response
const MaxContentLength = Number.MAX_SAFE_INTEGER;
const MaxBodyLength = Number.MAX_SAFE_INTEGER;
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
    protected axios: AxiosInstance;

    /**
     * Initializes new client with specific authentication method.
     * @param {string} root Root path for all endpoints (must not contain any slashes at the beginning nor end).
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host (must not contain slash at the end).
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
        this.axios = axios.create({
            baseURL: this.host + '/' + this.root + '/',
            maxContentLength: MaxContentLength,
            maxBodyLength: MaxBodyLength
        });
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
        this.axios = axios.create({ baseURL: this.host + '/' + this.root + '/' });
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

    // Makes a general request and returns the entire response (not just its parsed body)
    protected async fetch(config: AxiosRequestConfig) {
        return this.axios.request(config);
    }

    // Helper method for GET requests,
    // returning parsed response body or throwing an excetion in case of an issue
    protected async get(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[], repeatOn202: boolean = false): Promise<any> {
        const config: AxiosRequestConfig = { headers };
        await this.setAuthorization(config, scopes);
        let resp = await this.axios.get(endpoint, config);
        while (resp.status === 202 && repeatOn202) {
            sleep(RetryDelay);
            resp = await this.axios.get(endpoint, config);
        }
        return resp.data;
    }

    // Helper method for GET requests returning binary data,
    // throwing an excetion in case of an issue
    protected async getBuffer(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[], repeatOn202: boolean = false): Promise<any> {
        const config: AxiosRequestConfig = { headers, responseType: 'arraybuffer' };
        await this.setAuthorization(config, scopes);
        let resp = await this.axios.get(endpoint, config);
        while (resp.status === 202 && repeatOn202) {
            sleep(RetryDelay);
            resp = await this.axios.get(endpoint, config);
        }
        return resp.data;
    }

    // Helper method for GET requests returning stream data,
    // throwing an excetion in case of an issue
    protected async getStream(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[], repeatOn202: boolean = false): Promise<any> {
        const config: AxiosRequestConfig = { headers, responseType: 'stream' };
        await this.setAuthorization(config, scopes);
        let resp = await this.axios.get(endpoint, config);
        while (resp.status === 202 && repeatOn202) {
            sleep(RetryDelay);
            resp = await this.axios.get(endpoint, config);
        }
        return resp.data;
    }

    // Helper method for POST requests,
    // returning parsed response body of throwing an excetion in case of an issue
    protected async post(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes: string[]): Promise<any> {
        const config: AxiosRequestConfig = { headers };
        await this.setAuthorization(config, scopes);
        const resp = await this.axios.post(endpoint, data, config);
        return resp.data;
    }

    // Helper method for PUT requests,
    // returning parsed response body of throwing an excetion in case of an issue
    protected async put(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes: string[]): Promise<any> {
        const config: AxiosRequestConfig = { headers };
        await this.setAuthorization(config, scopes);
        const resp = await this.axios.put(endpoint, data, config);
        return resp.data;
    }

    // Helper method for PATCH requests,
    // returning parsed response body of throwing an excetion in case of an issue
    protected async patch(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes: string[]): Promise<any> {
        const config: AxiosRequestConfig = { headers };
        await this.setAuthorization(config, scopes);
        const resp = await this.axios.patch(endpoint, data, config);
        return resp.data;
    }

    // Helper method for DELETE requests,
    // returning parsed response body of throwing an excetion in case of an issue
    protected async delete(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[]): Promise<any> {
        const config: AxiosRequestConfig = { headers };
        await this.setAuthorization(config, scopes);
        const resp = await this.axios.delete(endpoint, config);
        return resp.data;
    }
}
