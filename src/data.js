const { get } = require('./request');
const { AuthenticationClient } = require('./auth');

/**
 * Client providing access to Autodesk Forge data management APIs.
 * {@link https://forge.autodesk.com/en/docs/data/v2/developers_guide/overview}.
 */
class DataManagementClient {
    /**
     * Initializes new client with Forge application credentials.
     * @param {string?} client_id Forge application client ID. If not provided,
     * the constructor will attempt to get the value from env. variable FORGE_CLIENT_ID.
     * @param {string?} client_secret Forge application client secret. If not provided,
     * the constructor will attempt to get the value from env. variable FORGE_CLIENT_SECRET.
     */
    constructor(client_id, client_secret) {
        this.auth = new AuthenticationClient(client_id, client_secret);
    }

    /**
     * Lists all buckets.
     * @returns {Promise<object[]>} List of bucket descriptions.
     */
    async buckets() {
        const access_token = await this.auth.authenticate(['bucket:read', 'data:read']);
        const response = await get('/oss/v2/buckets', { 'Authorization': 'Bearer ' + access_token });
        return response.items;
    }

    /**
     * Lists all objects in a bucket.
     * @param {string} bucket Bucket key.
     * @returns {Promise<object[]>} List of object descriptions.
     */
    async objects(bucket) {
        const access_token = await this.auth.authenticate(['bucket:read', 'data:read']);
        const response = await get(`/oss/v2/buckets/${bucket}/objects?limit=32`, { 'Authorization': 'Bearer ' + access_token });
        return response.items;
    }
}

module.exports = {
    DataManagementClient
};