import { IAuthOptions } from './common';
export interface IEngineDetail {
    productVersion: string;
    description: string;
    version: number;
    id: string;
}
export interface IAppBundleDetail {
    package: string;
    id: string;
    engine: string;
    description: string;
    version: number;
}
export interface IAppBundleUploadParams {
    uploadParameters: {
        formData: any;
        endpointURL: string;
    };
}
export interface IAlias {
    id: string;
    version: number;
}
export interface IActivityParam {
    name: string;
    verb?: string;
    description?: string;
    localName?: string;
    required?: boolean;
    zip?: boolean;
    ondemand?: boolean;
}
export interface IActivityConfig {
    id?: string;
    commandLine: string[] | string;
    description: string;
    engine: string;
    appbundles: string[];
    parameters: {
        [name: string]: any;
    };
    settings?: any;
}
export interface IActivityDetail {
    commandLine: string[];
    parameters: {
        [paramId: string]: IActivityParam;
    };
    id: string;
    engine: string;
    appbundles: string[];
    version: number;
}
export interface IWorkItemConfig {
    activityId: string;
    arguments: {
        [name: string]: any;
    };
}
export interface IWorkItem {
}
export interface IWorkItemParam {
    name: string;
    url: string;
    localName?: string;
    optional?: boolean;
    pathInZip?: string;
    headers?: object;
    verb?: string;
}
/**
 * Helper class for working with Design Automation
 * {@link https://forge.autodesk.com/en/docs/design-automation/v3/developers_guide/aliases-and-ids|aliases and IDs}.
 */
export declare class DesignAutomationID {
    owner: string;
    id: string;
    alias: string;
    /**
     * Parses fully qualified ID.
     * @param {string} str Fully qualified ID.
     * @returns {DesignAutomationID|null} Parsed ID or null if the format was not correct.
     */
    static parse(str: string): DesignAutomationID | null;
    /**
     * Creates new fully qualified ID.
     * @param {string} owner Owner part of the fully qualified ID. Must consist of a-z, A-Z, 0-9 and _ characters only.
     * @param {string} id ID part of the fully qualified ID. Must consist of a-z, A-Z, 0-9 and _ characters only.
     * @param {string} alias Alias part of the fully qualified ID. Must consist of a-z, A-Z, 0-9 and _ characters only.
     */
    constructor(owner: string, id: string, alias: string);
    /**
     * Outputs the fully qualified ID in a form expected by Design Automation endpoints.
     */
    toString(): string;
}
/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/design-automation/v3|design automation APIs}.
 * @tutorial design-automation
 */
export declare class DesignAutomationClient {
    private auth?;
    private token?;
    private host;
    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth: IAuthOptions, host?: string);
    private _get;
    private _post;
    private _put;
    private _patch;
    private _pager;
    private _collect;
    /**
     * Iterates over all engines in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @generator
     * @yields {AsyncIterable<string[]>} List of engine (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateEngines(): AsyncIterable<string[]>;
    /**
     * Gets a list of all engines
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @returns {Promise<string[]>} List of engine (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listEngines(): Promise<string[]>;
    /**
     * Gets single engine details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-id-GET|docs}).
     * @async
     * @param {string} engineId Fully qualified engine ID.
     * @returns {Promise<IEngineDetail>} Engine details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    getEngine(engineId: string): Promise<IEngineDetail>;
    /**
     * Iterates over all app bundles in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @generator
     * @yields {AsyncIterable<string[]>} List of appbundle (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateAppBundles(): AsyncIterable<string[]>;
    /**
     * Gets a list of all appbundles
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @returns {Promise<string[]>} List of appbundle (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listAppBundles(): Promise<string[]>;
    /**
     * Gets single appbundle details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-GET|docs}).
     * @async
     * @param {string} bundleId Fully qualified appbundle ID.
     * @returns {Promise<IAppBundleDetail>} Appbundle details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    getAppBundle(bundleId: string): Promise<IAppBundleDetail>;
    /**
     * Creates a new app bundle
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-POST|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @param {string} engine ID of one of the supported {@link engines}.
     * @param {string} description Bundle description.
     * @returns {Promise<IAppBundleDetail>} Details of created app bundle.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    createAppBundle(name: string, engine: string, description: string): Promise<IAppBundleDetail>;
    /**
     * Updates an existing app bundle, creating its new version
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-versions-POST|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @param {string} [engine] ID of one of the supported {@link engines}.
     * @param {string} [description] Bundle description.
     * @returns {Promise<IAppBundleDetail>} Details of updated app bundle.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    updateAppBundle(name: string, engine?: string, description?: string): Promise<IAppBundleDetail>;
    /**
     * Iterates over all app bundle aliases in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of the bundle.
     * @yields {AsyncIterable<IAlias[]>} List of appbundle alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateAppBundleAliases(name: string): AsyncIterable<IAlias[]>;
    /**
     * Gets a list of all appbundle aliases
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-GET|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @returns {Promise<IAlias[]>} List of appbundle alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listAppBundleAliases(name: string): Promise<IAlias[]>;
    /**
     * Iterates over all app bundle versions in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-versions-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of the bundle.
     * @yields {AsyncIterable<number[]>} List of appbundle version numbers.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateAppBundleVersions(name: string): AsyncIterable<number[]>;
    /**
     * Gets a list of all appbundle versions
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-versions-GET|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @returns {Promise<number[]>} List of appbundle version numbers.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listAppBundleVersions(name: string): Promise<number[]>;
    /**
     * Creates new alias for an app bundle
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-POST/|docs}).
     * @async
     * @param {string} name Name of the app bundle.
     * @param {string} alias Alias name.
     * @param {number} version Version of app bundle to link to this alias.
     * @returns {Promise<IAlias>} Details of the created alias.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    createAppBundleAlias(name: string, alias: string, version: number): Promise<IAlias>;
    /**
     * Updates existing alias for an app bundle
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-aliasId-PATCH/|docs}).
     * @async
     * @param {string} name Name of the app bundle.
     * @param {string} alias Alias name.
     * @param {number} version Version of app bundle to link to this alias.
     * @returns {Promise<IAlias>} Details of the updated alias.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    updateAppBundleAlias(name: string, alias: string, version: number): Promise<IAlias>;
    /**
     * Iterates over all activities in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @generator
     * @yields {AsyncIterable<string[]>} List of activity (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateActivities(): AsyncIterable<string[]>;
    /**
     * Gets a list of all activities
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @returns {Promise<string[]>} List of activity (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listActivities(): Promise<string[]>;
    /**
     * Gets single activity details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-GET|docs}).
     * @async
     * @param {string} activityId Fully qualified activity ID.
     * @returns {Promise<object>} Activity details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    getActivity(activityId: string): Promise<IActivityDetail>;
    private _inventorActivityConfig;
    private _revitActivityConfig;
    private _autocadActivityConfig;
    private _3dsmaxActivityConfig;
    /**
     * Creates new activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-POST|docs}).
     * @async
     * @param {string} id New activity ID.
     * @param {string} description Activity description.
     * @param {string} bundleName App bundle name.
     * @param {string} bundleAlias App bundle alias.
     * @param {string} engine ID of one of the supported {@link engines}.
     * @param {IActivityParam[]} inputs List of input descriptor objects, each containing required property `name`
     * and optional properties `description`, `localName`, `required`, `zip`, `ondemand`, and `verb` ("get" by default).
     * @param {IActivityParam[]} outputs List of output descriptor objects, each containing required property `name`
     * and optional properties `description`, `localName`, `required`, `zip`, `ondemand`, and `verb` ("put" by default).
     * @param {string} [script] Optional engine-specific script to pass to the activity.
     * @returns {Promise<IActivityDetail>} Details of created activity.
     */
    createActivity(id: string, description: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[], script?: string): Promise<IActivityDetail>;
    /**
     * Updates existing activity, creating its new version
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-POST|docs}).
     * @async
     * @param {string} id ID of updated activity.
     * @param {string} description Activity description.
     * @param {string} bundleName App bundle name.
     * @param {string} bundleAlias App bundle alias.
     * @param {string} engine ID of one of the supported {@link engines}.
     * @param {object[]} inputs List of input descriptor objects, each containing required property `name`
     * and optional properties `description`, `localName`, `required`, `zip`, `ondemand`, and `verb` ("get" by default).
     * @param {object[]} outputs List of output descriptor objects, each containing required property `name`
     * and optional properties `description`, `localName`, `required`, `zip`, `ondemand`, and `verb` ("put" by default).
     * @param {string} [script] Optional engine-specific script to pass to the activity.
     * @returns {Promise<object>} Details of created activity.
     */
    updateActivity(id: string, description: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[], script?: string): Promise<IActivityDetail>;
    /**
     * Iterates over all activity aliases in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of activity.
     * @yields {AsyncIterable<IAlias[]>} List of activity alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateActivityAliases(name: string): AsyncIterable<IAlias[]>;
    /**
     * Gets a list of all activity aliases
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-GET|docs}).
     * @async
     * @param {string} name Unique name of activity.
     * @returns {Promise<IAlias[]>} List of activity alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listActivityAliases(name: string): Promise<IAlias[]>;
    /**
     * Iterates over all activity versions in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of activity.
     * @yields {AsyncIterable<number[]>} List of activity versions.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateActivityVersions(name: string): AsyncIterable<number[]>;
    /**
     * Gets a list of all activity versions
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-GET|docs}).
     * @async
     * @param {string} name Unique name of activity.
     * @returns {Promise<number[]>} List of activity versions.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listActivityVersions(name: string): Promise<number[]>;
    /**
     * Creates new alias for an activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-POST|docs}).
     * @async
     * @param {string} id Activity ID.
     * @param {string} alias New alias name.
     * @param {number} version Activity version to link to this alias.
     * @returns {Promise<IAlias>} Details of created alias.
     */
    createActivityAlias(id: string, alias: string, version: number): Promise<IAlias>;
    /**
     * Updates existing alias for an activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-aliasId-PATCH|docs}).
     * @async
     * @param {string} id Activity ID.
     * @param {string} alias Activity alias.
     * @param {number} version Activity version to link to this alias.
     * @returns {Promise<IAlias>} Details of updated alias.
     */
    updateActivityAlias(id: string, alias: string, version: number): Promise<IAlias>;
    /**
     * Gets details of a specific work item
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/workitems-id-GET|docs}).
     * @async
     * @param {string} id Work item ID.
     * @returns {Promise<object>} Work item details.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    workItemDetails(id: string): Promise<any>;
    /**
     * Creates new work item
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/workitems-POST|docs}).
     * @async
     * @param {string} activityId Activity ID.
     * @param {IWorkItemParam[]} inputs List of input descriptor objects, each containing required properties `name`, `url`,
     * and optional properties `localName`, `optional`, `pathInZip`, `headers`, and `verb` ("get" by default).
     * @param {IWorkItemParam[]} outputs List of output descriptor objects, each containing required properties `name`, `url`,
     * and optional properties `localName`, `optional`, `pathInZip`, `headers`, and `verb` ("put" by default).
     */
    createWorkItem(activityId: string, inputs: IWorkItemParam[], outputs: IWorkItemParam[]): Promise<any>;
}
//# sourceMappingURL=design-automation.d.ts.map