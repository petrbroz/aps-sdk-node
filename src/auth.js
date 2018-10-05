const { post } = require('./request');

const RootPath = '/authentication/v1';

/**
 * Client providing access to Autodesk Forge authentication APIs.
 * {@link https://forge.autodesk.com/en/docs/oauth/v2}
 */
class AuthenticationClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * @param {string} [client_id] Forge application client ID. If not provided,
     * the constructor will attempt to get the value from env. variable FORGE_CLIENT_ID.
     * @param {string} [client_secret] Forge application client secret. If not provided,
     * the constructor will attempt to get the value from env. variable FORGE_CLIENT_SECRET.
     */
    constructor(client_id, client_secret) {
        this.client_id = client_id || process.env.FORGE_CLIENT_ID;
        this.client_secret = client_secret || process.env.FORGE_CLIENT_SECRET;
        this._cached = {}; // Dictionary of { promise: Promise<string>, expires_at: Number } objects
    }

    /**
     * Retrieves 2-legged access token for a specific set of scopes.
     * Unless the {@see force} parameter is used, the access tokens are cached
     * based on their scopes and the 'expires_in' field in the response.
     * @param {string[]} scopes List of requested {@link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes|scopes}.
     * @param {boolean} [force] Skip cache, if there is any, and retrieve a new token.
     * @returns {Promise<string>} 2-legged auth access token.
     * {@link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authenticate-POST}
     */
    authenticate(scopes, force = false) {
        // Check if there's a cached token, unexpired, and with the same scopes
        const key = 'two-legged/' + scopes.join('/');
        if (!force && key in this._cached) {
            const cache = this._cached[key];
            if (cache.expires_at > Date.now()) {
                return cache.promise;
            }
        }

        // Otherwise request a new token and cache it
        const data = {
            'client_id': this.client_id,
            'client_secret': this.client_secret,
            'grant_type': 'client_credentials',
            'scope': scopes.join(' ')
        };
        const req = post(`${RootPath}/authenticate`, data);
        const cache = {
            expires_at: Number.MAX_VALUE,
            promise: req.then(resp => resp.access_token)
        };
        this._cached[key] = cache;
        req.then((response) => {
            cache.expires_at = Date.now() + response.expires_in * 1000;
        });
        return cache.promise;
    }
}

module.exports = {
    AuthenticationClient
};