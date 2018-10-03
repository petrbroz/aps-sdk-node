const { get } = require('./request');
const { AuthenticationClient } = require('./auth');

/**
 * Client providing access to Autodesk Forge data management APIs.
 */
class DataManagementClient {
    constructor(client_id, client_secret) {
        this.auth = new AuthenticationClient(client_id, client_secret);
    }

    async buckets() {
        const access_token = await this.auth.authenticate(['bucket:read', 'data:read']);
        const response = await get('/oss/v2/buckets', { 'Authorization': 'Bearer ' + access_token });
        return response.items;
    }

    async objects(bucket) {
        const access_token = await this.auth.authenticate(['bucket:read', 'data:read']);
        const response = await get(`/oss/v2/buckets/${bucket}/objects?limit=32`, { 'Authorization': 'Bearer ' + access_token });
        return response.items;
    }
}

module.exports = {
    DataManagementClient
};