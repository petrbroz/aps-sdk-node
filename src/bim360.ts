import { get, DefaultHost } from './common';

interface IHub {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IProject {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IFolder {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IItem {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

interface IVersion {
    type: string;
    id: string;
    attributes: { [key: string]: any };
    links: { [key: string]: any };
    relationships: { [key: string]: any };
}

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/bim360/v1|BIM360 APIs}.
 */
export class BIM360Client {
    private token: string;
    private host: string;

    /**
     * Initializes new client with specific authentication method.
     * @param {string} token Authentication token.
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(token: string, host = DefaultHost) {
        this.token = token;
        this.host = host;
    }

    // Helper method for GET requests
    private async _get(endpoint: string, headers: { [name: string]: string } = {}) {
        headers['Authorization'] = 'Bearer ' + this.token;
        return get(this.host + endpoint, headers);
    }

    // Hub APIs

    /**
     * Gets a list of all hubs accessible to given credentials
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET|docs}).
     * @async
     * @returns {Promise<IHub[]>} List of hubs.
     */
    async hubs(): Promise<IHub[]> {
        const response = await this._get(`/project/v1/hubs`);
        return response.data;
    }

    /**
     * Gets a hub with specific ID.
     * @param {string} id Hub ID.
     * @async
     * @returns {Promise<IHub>} Hub or null if there isn't one.
     */
    async hub(id: string): Promise<IHub> {
        const response = await this._get(`/project/v1/hubs/${id}`);
        return response.data;
    }

    /**
     * Gets a list of all projects in a hub.
     * @param {string} hub Hub ID.
     * @async
     * @returns {Promise<IProject[]>} List of projects.
     */
    async projects(hub: string): Promise<IProject[]> {
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
    async folders(hub: string, project: string): Promise<IFolder[]> {
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
    async contents(project: string, folder: string): Promise<IItem[]> {
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
    async versions(project: string, item: string): Promise<IVersion[]> {
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
    async tip(project: string, item: string): Promise<IVersion> {
        const response = await this._get(`/data/v1/projects/${project}/items/${item}/tip`);
        return response.data;
    }
}
