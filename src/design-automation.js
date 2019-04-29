const { get, post, put, patch } = require('./request');
const { AuthenticationClient } = require('./authentication');

const RootPath = '/da/us-east/v3';
const ReadScopes = ['code:all'];

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/design-automation/v3|design automation APIs}.
 * @tutorial design-automation
 */
class DesignAutomationClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * @param {AuthenticationClient} auth Authentication client used to obtain tokens.
     * @param {string} [host="developer.api.autodesk.com"] Forge API host used for all requests.
     */
    constructor(auth, host) {
        this.auth = auth;
        this.host = host;
    }

    // Iterates (asynchronously) over pages of paginated results
    async *_pager(endpoint, scopes) {
        let authentication = await this.auth.authenticate(scopes);
        let headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        let response = await get(`${RootPath}${endpoint}`, headers, true, this.host);
        yield response.data;

        while (response.paginationToken) {
            authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
            response = await get(`${RootPath}${endpoint}?page=${response.paginationToken}`, headers, true, this.host);
            yield response.data;
        }
    }

    // Collects all pages of paginated results
    async _collect(endpoint, scopes) {
        let authentication = await this.auth.authenticate(scopes);
        let headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        let response = await get(`${RootPath}${endpoint}`, headers, true, this.host);
        let results = response.data;

        while (response.paginationToken) {
            authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
            response = await get(`${RootPath}${endpoint}?page=${response.paginationToken}`, headers, true, this.host);
            results = results.concat(response.data);
        }
        return results;
    }

    /**
     * Iterates over all engines in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @generator
     * @yields {Promise<object[]>} List of engines.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateEngines() {
        for await (const engines of this._pager('/engines', ReadScopes)) {
            yield engines;
        }
    }

    /**
     * Gets a list of all engines
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of engines.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listEngines() {
        return this._collect('/engines', ReadScopes);
    }

    /**
     * Iterates over all app bundles in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @generator
     * @yields {Promise<object[]>} List of appbundle objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateAppBundles() {
        for await (const bundles of this._pager('/appbundles', ReadScopes)) {
            yield bundles;
        }
    }

    /**
     * Gets a list of all appbundles
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of appbundle objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listAppBundles() {
        return this._collect('/appbundles', ReadScopes);
    }

    /**
     * Creates a new app bundle
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-POST|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @param {string} engine ID of one of the supported {@link engines}.
     * @param {string} description Bundle description.     * 
     * @returns {Promise<object>} Details of created app bundle.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async createAppBundle(name, engine, description) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = { id: name, description: description, engine: engine };
        const response = await post(`${RootPath}/appbundles`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Updates an existing app bundle, creating its new version
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-versions-POST|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @param {string} [engine] ID of one of the supported {@link engines}.
     * @param {string} [description] Bundle description.
     * @returns {Promise<object>} Details of updated app bundle.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async updateAppBundle(name, engine = undefined, description = undefined) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = {};
        if (description) config.description = description;
        if (engine) config.engine = engine;
        const response = await post(`${RootPath}/appbundles/${name}/versions`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Iterates over all app bundle aliases in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of the bundle.
     * @yields {Promise<object[]>} List of appbundle alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateAppBundleAliases(name) {
        for await (const aliases of this._pager(`/appbundles/${name}/aliases`, ReadScopes)) {
            yield aliases;
        }
    }

    /**
     * Gets a list of all appbundle aliases
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-GET|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @returns {Promise<object[]>} List of appbundle alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listAppBundleAliases(name) {
        return this._collect(`/appbundles/${name}/aliases`, ReadScopes);
    }

    /**
     * Iterates over all app bundle versions in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-versions-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of the bundle.
     * @yields {Promise<number[]>} List of appbundle version numbers.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateAppBundleVersions(name) {
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
    async listAppBundleVersions(name) {
        return this._collect(`/appbundles/${name}/versions`, ReadScopes);
    }

    /**
     * Creates new alias for an app bundle
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-POST/|docs}).
     * @async
     * @param {string} name Name of the app bundle.
     * @param {string} alias Alias name.
     * @param {number} version Version of app bundle to link to this alias.
     * @returns {Promise<object>} Details of the created alias.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async createAppBundleAlias(name, alias, version) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = { id: alias, version: version };
        const response = await post(`${RootPath}/appbundles/${name}/aliases`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Updates existing alias for an app bundle
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-aliases-aliasId-PATCH/|docs}).
     * @async
     * @param {string} name Name of the app bundle.
     * @param {string} alias Alias name.
     * @param {number} version Version of app bundle to link to this alias.
     * @returns {Promise<object>} Details of the updated alias.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async updateAppBundleAlias(name, alias, version) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = { version: version };
        const response = await patch(`${RootPath}/appbundles/${name}/aliases/${alias}`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Iterates over all activities in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @generator
     * @yields {Promise<object[]>} List of activities.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateActivities() {
        for await (const activities of this._pager('/activities', ReadScopes)) {
            yield activities;
        }
    }

    /**
     * Gets a list of all activities
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of activities.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listActivities() {
        return this._collect('/activities', ReadScopes);
    }

    /**
     * Creates new Inventor activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-POST/|docs}).
     * @async
     * @param {string} id New activity ID.
     * @param {string} description Activity description.
     * @param {string} bundleName App bundle name.
     * @param {string} bundleAlias App bundle alias.
     * @param {string} engine ID of one of the supported {@link engines}.
     * @param {object[]} inputs List of input descriptor objects, each containing properties `name` and `description`.
     * @param {object[]} outputs List of output descriptor objects, each containing properties `name` and `description`,
     * and optionally `localName`.
     * @returns {Primise<object>} Details of created activity.
     */
    async createInventorActivity(id, description, bundleName, bundleAlias, engine, inputs, outputs) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = {
            id: id,
            commandLine: [`$(engine.path)\\InventorCoreConsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${this.auth.client_id}.${bundleName}+${bundleAlias}`]
        };
        if (inputs.length > 0) {
            config.commandLine[0] += ' /i';
        }
        for (const input of inputs) {
            config.commandLine[0] += ` $(args[${input.name}].path)`;
            config.parameters[input.name] = { verb: 'get' };
            if (input.description) {
                config.parameters[input.name].description = input.description;
            }
        }
        for (const output of outputs) {
            config.parameters[output.name] = { verb: 'put' };
            if (output.description) {
                config.parameters[output.name].description = output.description;
            }
            if (output.localName) {
                config.parameters[output.name].localName = output.localName;
            }
        }
        const response = await post(`${RootPath}/activities`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Updates existing Inventor activity, creating its new version
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-POST|docs}).
     * @async
     * @param {string} id ID of updated activity.
     * @param {string} description Activity description.
     * @param {string} bundleName App bundle name.
     * @param {string} bundleAlias App bundle alias.
     * @param {string} engine ID of one of the supported {@link engines}.
     * @param {object[]} inputs List of input descriptor objects, each containing properties `name` and `description`.
     * @param {object[]} outputs List of output descriptor objects, each containing properties `name` and `description`,
     * and optionally `localName`.
     * @returns {Primise<object>} Details of created activity.
     */
    async updateInventorActivity(id, description, bundleName, bundleAlias, engine, inputs, outputs) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = {
            commandLine: [`$(engine.path)\\InventorCoreConsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${this.auth.client_id}.${bundleName}+${bundleAlias}`]
        };
        if (inputs.length > 0) {
            config.commandLine[0] += ' /i';
        }
        for (const input of inputs) {
            config.commandLine[0] += ` $(args[${input.name}].path)`;
            config.parameters[input.name] = { verb: 'get' };
            if (input.description) {
                config.parameters[input.name].description = input.description;
            }
            
        }
        for (const output of outputs) {
            config.parameters[output.name] = { verb: 'put' };
            if (output.description) {
                config.parameters[output.name].description = output.description;
            }
            if (output.localName) {
                config.parameters[output.name].localName = output.localName;
            }
        }
        const response = await post(`${RootPath}/activities/${id}/versions`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Creates new alias for an activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-POST|docs}).
     * @async
     * @param {string} id Activity ID.
     * @param {string} alias New alias name.
     * @param {number} version Activity version to link to this alias.
     * @returns {Promise<object>} Details of created alias.
     */
    async createActivityAlias(id, alias, version) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = { id: alias, version: version };
        const response = await post(`${RootPath}/activities/${id}/aliases`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Updates existing alias for an activity
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-aliasId-PATCH|docs}).
     * @async
     * @param {string} id Activity ID.
     * @param {string} alias Activity alias.
     * @param {number} version Activity version to link to this alias.
     * @returns {Promise<object>} Details of updated alias.
     */
    async updateActivityAlias(id, alias, version) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = { version: version };
        const response = await patch(`${RootPath}/activities/${id}/aliases/${alias}`, { json: config }, headers, true, this.host);
        return response;
    }

    /**
     * Gets details of a specific work item
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/workitems-id-GET|docs}).
     * @async
     * @param {string} id Work item ID.
     * @returns {Promise<object>} Work item details.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async workItemDetails(id) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const response = await get(`${RootPath}/workitems/${id}`, headers, true, this.host);
        return response;
    }

    /**
     * Creates new work item
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/workitems-POST|docs}).
     * @async
     * @param {string} activityId Activity ID.
     * @param {object[]} inputs List of input descriptor objects, each containing properties `name` and `url`,
     * and optionally `localName`.
     * @param {object[]} outputs List of output descriptor objects, each containing properties `name` and `url`.
     */
    async createWorkItem(activityId, inputs, outputs) {
        // TODO: tests
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = {
            activityId: activityId,
            arguments: {}
        };
        for (const input of inputs) {
            config.arguments[input.name] = { url: input.url };
            if (input.localName) {
                config.arguments[input.name].localName = input.localName;
            }
        }
        for (const output of outputs) {
            config.arguments[output.name] = { verb: 'put', url: output.url }
        }
        const response = await post(`${RootPath}/workitems`, { json: config }, headers, true, this.host);
        return response;
    }
}

module.exports = {
    DesignAutomationClient
};
