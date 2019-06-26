import { AuthenticationClient } from "./authentication";
import { Region, DefaultHost, get, post, put, patch, del } from "./common";

export type IAuthOptions = { client_id: string; client_secret: string; } | { token: string; };

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

    protected async setAuthorizationHeader(headers: { [name: string]: string } = {}, scopes: string[]) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }        
    }

    // Helper method for GET requests
    protected async get(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[]) {
        await this.setAuthorizationHeader(headers, scopes);
        return get(this.host + this.root + endpoint, headers);
    }

    // Helper method for POST requests
    protected async post(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes: string[]) {
        await this.setAuthorizationHeader(headers, scopes);
        return post(this.host + this.root + endpoint, data, headers);
    }

    // Helper method for PUT requests
    protected async put(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes: string[]) {
        await this.setAuthorizationHeader(headers, scopes);
        return put(this.host + this.root + endpoint, data, headers);
    }

    // Helper method for PATCH requests
    protected async patch(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes: string[]) {
        await this.setAuthorizationHeader(headers, scopes);
        return patch(this.host + this.root + endpoint, data, headers);
    }

    // Helper method for DELETE requests
    protected async delete(endpoint: string, headers: { [name: string]: string } = {}, scopes: string[]) {
        await this.setAuthorizationHeader(headers, scopes);
        return del(this.host + this.root + endpoint, headers);
    }
}
