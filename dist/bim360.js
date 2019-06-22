"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/bim360/v1|BIM360 APIs}.
 */
class BIM360Client {
    /**
     * Initializes new client with specific authentication method.
     * @param {string} token Authentication token.
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(token, host = common_1.DefaultHost) {
        this.token = token;
        this.host = host;
    }
    // Helper method for GET requests
    async _get(endpoint, headers = {}) {
        headers['Authorization'] = 'Bearer ' + this.token;
        return common_1.get(this.host + endpoint, headers);
    }
    // Hub APIs
    /**
     * Gets a list of all hubs accessible to given credentials
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET|docs}).
     * @async
     * @returns {Promise<IHub[]>} List of hubs.
     */
    async hubs() {
        const response = await this._get(`/project/v1/hubs`);
        return response.data;
    }
    /**
     * Gets a hub with specific ID.
     * @param {string} id Hub ID.
     * @async
     * @returns {Promise<IHub>} Hub or null if there isn't one.
     */
    async hub(id) {
        const response = await this._get(`/project/v1/hubs/${id}`);
        return response.data;
    }
    /**
     * Gets a list of all projects in a hub.
     * @param {string} hub Hub ID.
     * @async
     * @returns {Promise<IProject[]>} List of projects.
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
     * @returns {Promise<IFolder[]>} List of folder records.
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
     * @returns {Promise<IItem[]>} List of folder contents.
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
     * @returns {Promise<IVersion[]>} List of item versions.
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
     * @returns {Promise<IVersion>} Tip version of the item.
     */
    async tip(project, item) {
        const response = await this._get(`/data/v1/projects/${project}/items/${item}/tip`);
        return response.data;
    }
}
exports.BIM360Client = BIM360Client;
