const { get, post, put } = require('./request');

const RootPath = '/project/v1';

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/bim360/v1|BIM360 APIs}.
 */
class BIM360Client {
    /**
     * Initializes new client with specific 2-legged or 3-legged access token.
     * @param {string} access_token Access token to be used for all requests.
     */
    constructor(access_token) {
        this.access_token = access_token;
    }

    // Hub APIs

    /**
     * Gets a paginated list of all hubs accessible to given credentials
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of hubs.
     */
    async hubs() {
        let response = await get(`${RootPath}/hubs`, { 'Authorization': 'Bearer ' + this.access_token }, true);
        return response.data;
    }
}

module.exports = {
    BIM360Client
};