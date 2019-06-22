import { get, post, patch, put, DefaultHost, IAuthOptions } from './common';
import { AuthenticationClient } from './authentication';

const RootPath = '/da/us-east/v3';
const ReadScopes = ['code:all'];

const ActivityParameterProps = ['description', 'localName', 'required', 'zip', 'ondemand'];
const WorkitemParameterProps = ['localName', 'optional', 'pathInZip', 'headers'];

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
    // TODO
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
    parameters: { [name: string]: any };
    settings?: any;
}

export interface IActivityDetail {
    commandLine: string[];
    parameters: { [paramId: string]: IActivityParam };
    id: string;
    engine: string;
    appbundles: string[];
    version: number;
}

export interface IWorkItemConfig {
    activityId: string;
    arguments: { [name: string]: any };
}

export interface IWorkItem {
    // TODO
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
export class DesignAutomationID {
    /**
     * Parses fully qualified ID.
     * @param {string} str Fully qualified ID.
     * @returns {DesignAutomationID|null} Parsed ID or null if the format was not correct.
     */
    static parse(str: string): DesignAutomationID | null {
        const match = str.match(/^([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\+([\$a-zA-Z0-9_]+)$/);
        if (match) {
            return new DesignAutomationID(match[1], match[2], match[3]);
        } else {
            return null;
        }
    }

    /**
     * Creates new fully qualified ID.
     * @param {string} owner Owner part of the fully qualified ID. Must consist of a-z, A-Z, 0-9 and _ characters only.
     * @param {string} id ID part of the fully qualified ID. Must consist of a-z, A-Z, 0-9 and _ characters only.
     * @param {string} alias Alias part of the fully qualified ID. Must consist of a-z, A-Z, 0-9 and _ characters only.
     */
    constructor(public owner: string, public id: string, public alias: string) {
    }

    /**
     * Outputs the fully qualified ID in a form expected by Design Automation endpoints.
     */
    toString() {
        return `${this.owner}.${this.id}+${this.alias}`;
    }
}

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/design-automation/v3|design automation APIs}.
 * @tutorial design-automation
 */
export class DesignAutomationClient {
    private auth?: AuthenticationClient;
    private token?: string;
    private host: string;

    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth: IAuthOptions, host: string = DefaultHost) {
        if ('client_id' in auth && 'client_secret' in auth) {
            this.auth = new AuthenticationClient(auth.client_id, auth.client_secret, host);
        } else if (auth.token) {
            this.token = auth.token;
        } else {
            throw new Error('Authentication parameters missing or incorrect.');
        }
        this.host = host;
    }

    // Helper method for GET requests
    private async _get(endpoint: string, headers: { [name: string]: string } = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return get(this.host + RootPath + endpoint, headers);
    }

    // Helper method for POST requests
    private async _post(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return post(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for PUT requests
    private async _put(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return put(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for PATCH requests
    private async _patch(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return patch(this.host + RootPath + endpoint, data, headers);
    }

    // Iterates (asynchronously) over pages of paginated results
    private async *_pager(endpoint: string, scopes: string[]) {
        let response = await this._get(endpoint, {}, scopes);
        yield response.data;

        while (response.paginationToken) {
            response = await this._get(`${endpoint}?page=${response.paginationToken}`, {}, scopes);
            yield response.data;
        }
    }

    // Collects all pages of paginated results
    private async _collect(endpoint: string, scopes: string[]) {
        let response = await this._get(endpoint, {}, scopes);
        let results = response.data;

        while (response.paginationToken) {
            response = await this._get(`${endpoint}?page=${response.paginationToken}`, {}, scopes);
            results = results.concat(response.data);
        }
        return results;
    }

    /**
     * Iterates over all engines in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @generator
     * @yields {AsyncIterable<string[]>} List of engine (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateEngines(): AsyncIterable<string[]> {
        for await (const engines of this._pager('/engines', ReadScopes)) {
            yield engines;
        }
    }

    /**
     * Gets a list of all engines
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @returns {Promise<string[]>} List of engine (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listEngines(): Promise<string[]> {
        return this._collect('/engines', ReadScopes);
    }

    /**
     * Gets single engine details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-id-GET|docs}).
     * @async
     * @param {string} engineId Fully qualified engine ID.
     * @returns {Promise<IEngineDetail>} Engine details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getEngine(engineId: string): Promise<IEngineDetail> {
        return this._get(`/engines/${engineId}`);
    }

    /**
     * Iterates over all app bundles in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @generator
     * @yields {AsyncIterable<string[]>} List of appbundle (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateAppBundles(): AsyncIterable<string[]> {
        for await (const bundles of this._pager('/appbundles', ReadScopes)) {
            yield bundles;
        }
    }

    /**
     * Gets a list of all appbundles
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @returns {Promise<string[]>} List of appbundle (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listAppBundles(): Promise<string[]> {
        return this._collect('/appbundles', ReadScopes);
    }

    /**
     * Gets single appbundle details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-GET|docs}).
     * @async
     * @param {string} bundleId Fully qualified appbundle ID.
     * @returns {Promise<IAppBundleDetail>} Appbundle details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getAppBundle(bundleId: string): Promise<IAppBundleDetail> {
        return this._get(`/appbundles/${bundleId}`);
    }

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
    async createAppBundle(name: string, engine: string, description: string): Promise<IAppBundleDetail> {
        const config = { id: name, description: description, engine: engine };
        return this._post('/appbundles', { json: config });
    }

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
    async updateAppBundle(name: string, engine?: string, description?: string): Promise<IAppBundleDetail> {
        // TODO: tests
        const config: { engine?: string; description?: string; } = {};
        if (description) config.description = description;
        if (engine) config.engine = engine;
        return this._post(`/appbundles/${name}/versions`, { json: config });
    }

    /**
     * Iterates over all app bundle aliases in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of the bundle.
     * @yields {AsyncIterable<IAlias[]>} List of appbundle alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateAppBundleAliases(name: string): AsyncIterable<IAlias[]> {
        for await (const aliases of this._pager(`/appbundles/${name}/aliases`, ReadScopes)) {
            yield aliases;
        }
    }

    /**
     * Gets a list of all appbundle aliases
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-GET|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @returns {Promise<IAlias[]>} List of appbundle alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listAppBundleAliases(name: string): Promise<IAlias[]> {
        return this._collect(`/appbundles/${name}/aliases`, ReadScopes);
    }

    /**
     * Iterates over all app bundle versions in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-versions-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of the bundle.
     * @yields {AsyncIterable<number[]>} List of appbundle version numbers.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateAppBundleVersions(name: string): AsyncIterable<number[]> {
        for await (const versions of this._pager(`/appbundles/${name}/versions`, ReadScopes)) {
            yield versions;
        }
    }

    /**
     * Gets a list of all appbundle versions
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-versions-GET|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @returns {Promise<number[]>} List of appbundle version numbers.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listAppBundleVersions(name: string): Promise<number[]> {
        return this._collect(`/appbundles/${name}/versions`, ReadScopes);
    }

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
    async createAppBundleAlias(name: string, alias: string, version: number): Promise<IAlias> {
        // TODO: tests
        const config = { id: alias, version: version };
        return this._post(`/appbundles/${name}/aliases`, { json: config });
    }

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
    async updateAppBundleAlias(name: string, alias: string, version: number): Promise<IAlias> {
        // TODO: tests
        const config = { version: version };
        return this._patch(`/appbundles/${name}/aliases/${alias}`, { json: config });
    }

    /**
     * Iterates over all activities in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @generator
     * @yields {AsyncIterable<string[]>} List of activity (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateActivities(): AsyncIterable<string[]> {
        for await (const activities of this._pager('/activities', ReadScopes)) {
            yield activities;
        }
    }

    /**
     * Gets a list of all activities
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @returns {Promise<string[]>} List of activity (full) IDs.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listActivities(): Promise<string[]> {
        return this._collect('/activities', ReadScopes);
    }

    /**
     * Gets single activity details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-GET|docs}).
     * @async
     * @param {string} activityId Fully qualified activity ID.
     * @returns {Promise<object>} Activity details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getActivity(activityId: string): Promise<IActivityDetail> {
        return this._get(`/activities/${activityId}`);
    }

    private _inventorActivityConfig(activityId: string | null, description: string, ownerId: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[]): IActivityConfig {
        const config: IActivityConfig = {
            commandLine: [`$(engine.path)\\InventorCoreConsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (activityId) {
            config.id = activityId;
        }
        if (inputs.length > 0 && Array.isArray(config.commandLine)) {
            config.commandLine[0] += ' /i';
            for (const input of inputs) {
                config.commandLine[0] += ` $(args[${input.name}].path)`;
                const param: any = config.parameters[input.name] = { verb: input.verb || 'get' };
                for (const prop of ActivityParameterProps) {
                    if (input.hasOwnProperty(prop)) {
                        param[prop] = (<any>input)[prop];
                    }
                }
            }
        }
        for (const output of outputs) {
            const param: any = config.parameters[output.name] = { verb: output.verb || 'put' };
            for (const prop of ActivityParameterProps) {
                if (output.hasOwnProperty(prop)) {
                    param[prop] = (<any>output)[prop];
                }
            }
        }
        return config;
    }

    private _revitActivityConfig(activityId: string | null, description: string, ownerId: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[]): IActivityConfig {
        const config: IActivityConfig = {
            commandLine: [`$(engine.path)\\revitcoreconsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (activityId) {
            config.id = activityId;
        }
        if (inputs.length > 0 && Array.isArray(config.commandLine)) {
            config.commandLine[0] += ' /i';
            for (const input of inputs) {
                config.commandLine[0] += ` $(args[${input.name}].path)`;
                const param: any = config.parameters[input.name] = { verb: input.verb || 'get' };
                for (const prop of ActivityParameterProps) {
                    if (input.hasOwnProperty(prop)) {
                        param[prop] = (<any>input)[prop];
                    }
                }
            }
        }
        for (const output of outputs) {
            const param: any = config.parameters[output.name] = { verb: output.verb || 'put' };
            for (const prop of ActivityParameterProps) {
                if (output.hasOwnProperty(prop)) {
                    param[prop] = (<any>output)[prop];
                }
            }
        }
        return config;
    }

    private _autocadActivityConfig(activityId: string | null, description: string, ownerId: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[], script?: string): IActivityConfig {
        const config: IActivityConfig = {
            commandLine: [`$(engine.path)\\accoreconsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (activityId) {
            config.id = activityId;
        }
        if (inputs.length > 0 && Array.isArray(config.commandLine)) {
            config.commandLine[0] += ' /i';
            for (const input of inputs) {
                config.commandLine[0] += ` $(args[${input.name}].path)`;
                const param: any = config.parameters[input.name] = { verb: input.verb || 'get' };
                for (const prop of ActivityParameterProps) {
                    if (input.hasOwnProperty(prop)) {
                        param[prop] = (<any>input)[prop];
                    }
                }
            }
        }
        for (const output of outputs) {
            const param: any = config.parameters[output.name] = { verb: output.verb || 'put' };
            for (const prop of ActivityParameterProps) {
                if (output.hasOwnProperty(prop)) {
                    param[prop] = (<any>output)[prop];
                }
            }
        }
        if (script && Array.isArray(config.commandLine)) {
            config.settings = {
                script: script
            };
            config.commandLine[0] += ' /s $(settings[script].path)';
        }
        return config;
    }

    private _3dsmaxActivityConfig(activityId: string | null, description: string, ownerId: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[], script?: string): IActivityConfig {
        const config: IActivityConfig = {
            commandLine: `$(engine.path)\\3dsmaxbatch.exe`,
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (activityId) {
            config.id = activityId;
        }
        if (inputs.length > 1) {
            throw new Error('3dsMax engine only supports single input file.')
        } else if (inputs.length > 0) {
            const input = inputs[0];
            config.commandLine += ` -sceneFile \"$(args[${input.name}].path)\"`;
            const param: any = config.parameters[input.name] = { verb: input.verb || 'get' };
            for (const prop of ActivityParameterProps) {
                if (input.hasOwnProperty(prop)) {
                    param[prop] = (<any>input)[prop];
                }
            }
        }
        for (const output of outputs) {
            const param: any = config.parameters[output.name] = { verb: output.verb || 'put' };
            for (const prop of ActivityParameterProps) {
                if (output.hasOwnProperty(prop)) {
                    param[prop] = (<any>output)[prop];
                }
            }
        }
        if (script) {
            config.settings = {
                script: script
            };
            config.commandLine += ' \"$(settings[script].path)\"';
        }
        return config;
    }

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
    async createActivity(id: string, description: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[], script?: string): Promise<IActivityDetail> {
        // TODO: tests
        const engineId = DesignAutomationID.parse(engine);
        if (!engineId) {
            throw new Error('Could not parse engine ID.');
        }
        if (!this.auth) {
            throw new Error('Cannot create activity without client ID.');
        }
        let config;
        switch (engineId.id) {
            case 'AutoCAD':
                config = this._autocadActivityConfig(id, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs, script);
                break;
            case '3dsMax':
                config = this._3dsmaxActivityConfig(id, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs, script)
                break;
            case 'Revit':
                config = this._revitActivityConfig(id, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs);
                break;
            case 'Inventor':
                config = this._inventorActivityConfig(id, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs);
                break;
        }
        return this._post('/activities', { json: config });
    }

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
    async updateActivity(id: string, description: string, bundleName: string, bundleAlias: string, engine: string, inputs: IActivityParam[], outputs: IActivityParam[], script?: string): Promise<IActivityDetail> {
        // TODO: tests
        const engineId = DesignAutomationID.parse(engine);
        if (!engineId) {
            throw new Error('Could not parse engine ID.');
        }
        if (!this.auth) {
            throw new Error('Cannot create activity without client ID.');
        }
        let config;
        switch (engineId.id) {
            case 'AutoCAD':
                config = this._autocadActivityConfig(null, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs, script);
                break;
            case '3dsMax':
                config = this._3dsmaxActivityConfig(null, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs, script)
                break;
            case 'Revit':
                config = this._revitActivityConfig(null, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs);
                break;
            case 'Inventor':
                config = this._inventorActivityConfig(null, description, this.auth.clientId, bundleName, bundleAlias, engine, inputs, outputs);
                break;
        }
        return this._post(`/activities/${id}/versions`, { json: config });
    }

    /**
     * Iterates over all activity aliases in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of activity.
     * @yields {AsyncIterable<IAlias[]>} List of activity alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateActivityAliases(name: string): AsyncIterable<IAlias[]> {
        for await (const aliases of this._pager(`/activities/${name}/aliases`, ReadScopes)) {
            yield aliases;
        }
    }

    /**
     * Gets a list of all activity aliases
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-GET|docs}).
     * @async
     * @param {string} name Unique name of activity.
     * @returns {Promise<IAlias[]>} List of activity alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listActivityAliases(name: string): Promise<IAlias[]> {
        return this._collect(`/activities/${name}/aliases`, ReadScopes);
    }

    /**
     * Iterates over all activity versions in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of activity.
     * @yields {AsyncIterable<number[]>} List of activity versions.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateActivityVersions(name: string): AsyncIterable<number[]> {
        for await (const versions of this._pager(`/activities/${name}/versions`, ReadScopes)) {
            yield versions;
        }
    }

    /**
     * Gets a list of all activity versions
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-GET|docs}).
     * @async
     * @param {string} name Unique name of activity.
     * @returns {Promise<number[]>} List of activity versions.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listActivityVersions(name: string): Promise<number[]> {
        return this._collect(`/activities/${name}/versions`, ReadScopes);
    }

    /**
     * Creates new alias for an activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-POST|docs}).
     * @async
     * @param {string} id Activity ID.
     * @param {string} alias New alias name.
     * @param {number} version Activity version to link to this alias.
     * @returns {Promise<IAlias>} Details of created alias.
     */
    async createActivityAlias(id: string, alias: string, version: number): Promise<IAlias> {
        // TODO: tests
        const config = { id: alias, version: version };
        return this._post(`/activities/${id}/aliases`, { json: config });
    }

    /**
     * Updates existing alias for an activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-aliasId-PATCH|docs}).
     * @async
     * @param {string} id Activity ID.
     * @param {string} alias Activity alias.
     * @param {number} version Activity version to link to this alias.
     * @returns {Promise<IAlias>} Details of updated alias.
     */
    async updateActivityAlias(id: string, alias: string, version: number): Promise<IAlias> {
        // TODO: tests
        const config = { version: version };
        return this._patch(`/activities/${id}/aliases/${alias}`, { json: config });
    }

    /**
     * Gets details of a specific work item
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/workitems-id-GET|docs}).
     * @async
     * @param {string} id Work item ID.
     * @returns {Promise<object>} Work item details.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async workItemDetails(id: string) {
        return this._get(`/workitems/${id}`);
    }

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
    async createWorkItem(activityId: string, inputs: IWorkItemParam[], outputs: IWorkItemParam[]) {
        // TODO: tests
        const config: IWorkItemConfig = {
            activityId: activityId,
            arguments: {}
        };
        for (const input of inputs) {
            const param: any = config.arguments[input.name] = { verb: input.verb || 'get', url: input.url };
            for (const prop of WorkitemParameterProps) {
                if (input.hasOwnProperty(prop)) {
                    param[prop] = (<any>input)[prop];
                }
            }
        }
        for (const output of outputs) {
            const param: any = config.arguments[output.name] = { verb: output.verb || 'put', url: output.url };
            for (const prop of WorkitemParameterProps) {
                if (output.hasOwnProperty(prop)) {
                    param[prop] = (<any>output)[prop];
                }
            }
        }
        return this._post('/workitems', { json: config });
    }
}
