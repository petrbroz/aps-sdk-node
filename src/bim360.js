const { get, DefaultHost } = require('./common');
const { AuthenticationClient } = require('./authentication');

const { FORGE_ACCESS_TOKEN } = process.env;

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/bim360/v1|BIM360 APIs}.
 */
class BIM360Client {
    /**
     * Initializes new client with specific authentication method.
     * @param {object} [auth={token: FORGE_ACCESS_TOKEN}] Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth = { token: FORGE_ACCESS_TOKEN }, host = DefaultHost) {
        if (auth.client_id && auth.client_secret) {
            this.auth = new AuthenticationClient(auth.client_id, auth.client_secret, host);
        } else if (auth.token) {
            this.token = auth.token;
        } else {
            throw new Error('Authentication parameters missing or incorrect.');
        }
        this.host = host;
    }

    // Helper method for GET requests
    async _get(endpoint, headers = {}) {
        headers['Authorization'] = 'Bearer ' + this.token;
        return get(this.host + endpoint, headers);
    }

    // Hub APIs

    /**
     * Gets a list of all hubs accessible to given credentials
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of hubs.
     */
    async hubs() {
        const response = await this._get(`/project/v1/hubs`);
        return response.data;
    }

    /**
     * Gets a hub with specific ID.
     * @param {string} id Hub ID.
     * @async
     * @returns {Promise<object>} Hub or null if there isn't one.
     */
    async hub(id) {
        const response = await this._get(`/project/v1/hubs/${id}`);
        return response.data;
    }

    /**
     * Gets a list of all projects in a hub.
     * @param {string} hub Hub ID.
     * @async
     * @returns {Promise<object[]>} List of projects.
     */
    async projects(hub) {
        const response = await this._get(`/project/v1/hubs/${hub}/projects`);
        return response.data;
    }

    /**
     * Gets a list of top folders in a project.
     * @param {string} hub Hub ID.
     * @param {string} project Project ID.
     * @async
     * @returns {Promise<object[]>} List of folder records.
     */
    async folders(hub, project) {
        const response = await this._get(`/project/v1/hubs/${hub}/projects/${project}/topFolders`);
        return response.data;
    }

    /**
     * Gets contents of a folder.
     * @param {string} project Project ID.
     * @param {string} folder Folder ID.
     * @async
     * @returns {Promise<object[]>} List of folder contents.
     */
    async contents(project, folder) {
        const response = await this._get(`/data/v1/projects/${project}/folders/${folder}/contents`);
        return response.data;
    }

    /**
     * Gets versions of a folder item.
     * @param {string} project Project ID.
     * @param {string} item Item ID.
     * @async
     * @returns {Promise<object[]>} List of item versions.
     */
    async versions(project, item) {
        const response = await this._get(`/data/v1/projects/${project}/items/${item}/versions`);
        return response.data;
    }

    /**
     * Gets "tip" version of a folder item.
     * @param {string} project Project ID.
     * @param {string} item Item ID.
     * @async
     * @returns {Promise<object>} Tip version of the item.
     */
    async tip(project, item) {
        const response = await this._get(`/data/v1/projects/${project}/items/${item}/tip`);
        return response.data;
    }
}

module.exports = {
    BIM360Client
};
