const { post } = require('./request');

/**
 * Client providing access to Autodesk Forge authentication APIs.
 */
class AuthenticationClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * @param {string?} client_id Forge application client ID. If not provided,
     * the constructor will attempt to get the value from env. variable FORGE_CLIENT_ID.
     * @param {string?} client_secret Forge application client secret. If not provided,
     * the constructor will attempt to get the value from env. variable FORGE_CLIENT_SECRET.
     */
    constructor(client_id, client_secret) {
        this.client_id = client_id || process.env.FORGE_CLIENT_ID;
        this.client_secret = client_secret || process.env.FORGE_CLIENT_SECRET;
    }

    /**
     * Retrieves 2-legged access token for specific set of scopes.
     * See https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authenticate-POST for more info.
     * @param {string[]} scopes List of requested scopes.
     * @returns {Promise<string>} 2-legged auth access token.
     */
    async authenticate(scopes) {
        const data = {
            'client_id': this.client_id,
            'client_secret': this.client_secret,
            'grant_type': 'client_credentials',
            'scope': scopes.join(' ')
        };
        const response = await post('/authentication/v1/authenticate', data);
        return response.access_token;
    }
}

module.exports = {
    AuthenticationClient
};