const { get, DefaultHost } = require('./common');

const RootPath = '/project/v1';
const DataRootPath = '/data/v1';

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/bim360/v1|BIM360 APIs}.
 */
class BIM360Client {
    /**
     * Initializes new client with specific 2-legged or 3-legged access token.
     * @param {string} access_token Access token to be used for all requests.
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(access_token, host = DefaultHost) {
        this.access_token = access_token;
        this.host = host;
    }

    // Hub APIs

    /**
     * Gets a list of all hubs accessible to given credentials
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of hubs.
     */
    async hubs() {
        let response = await get(`${this.host}${RootPath}/hubs`, { 'Authorization': 'Bearer ' + this.access_token });
        return response.data;
    }

    /**
     * Gets a hub with specific ID.
     * @param {string} id Hub ID.
     * @async
     * @returns {Promise<object>} Hub or null if there isn't one.
     */
    async hub(id) {
        try {
            let response = await get(`${this.host}${RootPath}/hubs/${id}`, { 'Authorization': 'Bearer ' + this.access_token }, true);
            return response.data;
        } catch(err) {
            return null;
        }
    }

    /**
     * Gets a list of all projects in a hub.
     * @param {string} hub Hub ID.
     * @async
     * @returns {Promise<object[]>} List of projects.
     */
    async projects(hub) {
        let response = await get(`${this.host}${RootPath}/hubs/${hub}/projects`, { 'Authorization': 'Bearer ' + this.access_token });
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
        let response = await get(`${this.host}${RootPath}/hubs/${hub}/projects/${project}/topFolders`, { 'Authorization': 'Bearer ' + this.access_token });
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
        let response = await get(`${this.host}${DataRootPath}/projects/${project}/folders/${folder}/contents`, { 'Authorization': 'Bearer ' + this.access_token });
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
        let response = await get(`${this.host}${DataRootPath}/projects/${project}/items/${item}/versions`, { 'Authorization': 'Bearer ' + this.access_token });
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
        let response = await get(`${this.host}${DataRootPath}/projects/${project}/items/${item}/tip`, { 'Authorization': 'Bearer ' + this.access_token });
        return response.data;
    }
}

module.exports = {
    BIM360Client
};
