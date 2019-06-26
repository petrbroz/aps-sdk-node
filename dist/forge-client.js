"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("./authentication");
const common_1 = require("./common");
class ForgeClient {
    /**
     * Initializes new client with specific authentication method.
     * @param {string} root Root path for all endpoints.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region ("US" or "EMEA").
     */
    constructor(root, auth, host, region) {
        if ('client_id' in auth && 'client_secret' in auth) {
            this.auth = new authentication_1.AuthenticationClient(auth.client_id, auth.client_secret, host);
        }
        else if ('token' in auth) {
            this.token = auth.token;
        }
        else {
            throw new Error('Authentication parameters missing or incorrect.');
        }
        this.root = root;
        this.host = host || common_1.DefaultHost;
        this.region = region || common_1.Region.US;
    }
    async setAuthorizationHeader(headers = {}, scopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        }
        else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
    }
    // Helper method for GET requests
    async get(endpoint, headers = {}, scopes) {
        await this.setAuthorizationHeader(headers, scopes);
        return common_1.get(this.host + this.root + endpoint, headers);
    }
    // Helper method for POST requests
    async post(endpoint, data, headers = {}, scopes) {
        await this.setAuthorizationHeader(headers, scopes);
        return common_1.post(this.host + this.root + endpoint, data, headers);
    }
    // Helper method for PUT requests
    async put(endpoint, data, headers = {}, scopes) {
        await this.setAuthorizationHeader(headers, scopes);
        return common_1.put(this.host + this.root + endpoint, data, headers);
    }
    // Helper method for PATCH requests
    async patch(endpoint, data, headers = {}, scopes) {
        await this.setAuthorizationHeader(headers, scopes);
        return common_1.patch(this.host + this.root + endpoint, data, headers);
    }
    // Helper method for DELETE requests
    async delete(endpoint, headers = {}, scopes) {
        await this.setAuthorizationHeader(headers, scopes);
        return common_1.del(this.host + this.root + endpoint, headers);
    }
}
exports.ForgeClient = ForgeClient;
