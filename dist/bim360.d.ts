interface IHub {
    type: string;
    id: string;
    attributes: {
        [key: string]: any;
    };
    links: {
        [key: string]: any;
    };
    relationships: {
        [key: string]: any;
    };
}
interface IProject {
    type: string;
    id: string;
    attributes: {
        [key: string]: any;
    };
    links: {
        [key: string]: any;
    };
    relationships: {
        [key: string]: any;
    };
}
interface IFolder {
    type: string;
    id: string;
    attributes: {
        [key: string]: any;
    };
    links: {
        [key: string]: any;
    };
    relationships: {
        [key: string]: any;
    };
}
interface IItem {
    type: string;
    id: string;
    attributes: {
        [key: string]: any;
    };
    links: {
        [key: string]: any;
    };
    relationships: {
        [key: string]: any;
    };
}
interface IVersion {
    type: string;
    id: string;
    attributes: {
        [key: string]: any;
    };
    links: {
        [key: string]: any;
    };
    relationships: {
        [key: string]: any;
    };
}
/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/bim360/v1|BIM360 APIs}.
 */
export declare class BIM360Client {
    private token;
    private host;
    /**
     * Initializes new client with specific authentication method.
     * @param {string} token Authentication token.
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(token: string, host?: string);
    private _get;
    /**
     * Gets a list of all hubs accessible to given credentials
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET|docs}).
     * @async
     * @returns {Promise<IHub[]>} List of hubs.
     */
    hubs(): Promise<IHub[]>;
    /**
     * Gets a hub with specific ID.
     * @param {string} id Hub ID.
     * @async
     * @returns {Promise<IHub>} Hub or null if there isn't one.
     */
    hub(id: string): Promise<IHub>;
    /**
     * Gets a list of all projects in a hub.
     * @param {string} hub Hub ID.
     * @async
     * @returns {Promise<IProject[]>} List of projects.
     */
    projects(hub: string): Promise<IProject[]>;
    /**
     * Gets a list of top folders in a project.
     * @param {string} hub Hub ID.
     * @param {string} project Project ID.
     * @async
     * @returns {Promise<IFolder[]>} List of folder records.
     */
    folders(hub: string, project: string): Promise<IFolder[]>;
    /**
     * Gets contents of a folder.
     * @param {string} project Project ID.
     * @param {string} folder Folder ID.
     * @async
     * @returns {Promise<IItem[]>} List of folder contents.
     */
    contents(project: string, folder: string): Promise<IItem[]>;
    /**
     * Gets versions of a folder item.
     * @param {string} project Project ID.
     * @param {string} item Item ID.
     * @async
     * @returns {Promise<IVersion[]>} List of item versions.
     */
    versions(project: string, item: string): Promise<IVersion[]>;
    /**
     * Gets "tip" version of a folder item.
     * @param {string} project Project ID.
     * @param {string} item Item ID.
     * @async
     * @returns {Promise<IVersion>} Tip version of the item.
     */
    tip(project: string, item: string): Promise<IVersion>;
}
export {};
//# sourceMappingURL=bim360.d.ts.map