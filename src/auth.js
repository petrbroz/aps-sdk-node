const { post } = require('./request');

const RootPath = '/authentication/v1';

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/oauth/v2|authentication APIs}.
 * @tutorial auth-basic
 */
class AuthenticationClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * If the credentials are not provided, the client will attempt to obtain them
     * from env. variables FORGE_CLIENT_ID and FORGE_CLIENT_SECRET.
     * @param {string} [client_id] Forge application client ID. 
     * @param {string} [client_secret] Forge application client secret.
     */
    constructor(client_id, client_secret) {
        this.client_id = client_id || process.env.FORGE_CLIENT_ID;
        this.client_secret = client_secret || process.env.FORGE_CLIENT_SECRET;
        this._cached = {}; // Dictionary of { promise: Promise<string>, expires_at: Number } objects
    }

    /**
     * Retrieves 2-legged access token for a specific set of scopes
     * ({@link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authenticate-POST|docs}).
     * Unless the {@see force} parameter is used, the access tokens are cached
     * based on their scopes and the 'expires_in' field in the response.
     * @param {string[]} scopes List of requested {@link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes|scopes}.
     * @param {boolean} [force] Skip cache, if there is any, and retrieve a new token.
     * @returns {Promise<object>} Promise of 2-legged authentication object containing two fields,
     * 'access_token' with the actual token, and 'expires_in' with expiration time (in seconds).
     */
    authenticate(scopes, force = false) {
        // Check if there's a cached token, unexpired, and with the same scopes
        const key = 'two-legged/' + scopes.join('/');
        if (!force && key in this._cached) {
            const cache = this._cached[key];
            if (cache.expires_at > Date.now()) {
                return cache.promise.then((token) => ({
                    access_token: token,
                    expires_in: Math.floor((cache.expires_at - Date.now()) / 1000)
                }));
            }
        }

        // Otherwise request a new token and cache it
        const params = {
            'client_id': this.client_id,
            'client_secret': this.client_secret,
            'grant_type': 'client_credentials',
            'scope': scopes.join(' ')
        };
        const cache = this._cached[key] = {
            expires_at: Number.MAX_VALUE,
            promise: post(`${RootPath}/authenticate`, { urlencoded: params }).then((resp) => {
                this._cached[key].expires_at = Date.now() + resp.expires_in * 1000;
                return resp.access_token;
            })
        };
        return cache.promise.then((token) => ({
            access_token: token,
            expires_in: Math.floor((cache.expires_at - Date.now()) / 1000)
        }));
    }
}

module.exports = {
    AuthenticationClient
};