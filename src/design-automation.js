const { get, post, patch, DefaultHost, DesignAutomationURI } = require('./common');
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
     * Initializes new client with specific authentication method.
     * @param {object} [auth={client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET}] Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth = { client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET }, host = DefaultHost) {
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
    async _get(endpoint, headers = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return get(this.host + RootPath + endpoint, headers);
    }

    // Helper method for POST requests
    async _post(endpoint, data, headers = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return post(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for PUT requests
    async _put(endpoint, data, headers = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return put(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for PATCH requests
    async _patch(endpoint, data, headers = {}, scopes = ReadScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return patch(this.host + RootPath + endpoint, data, headers);
    }

    // Iterates (asynchronously) over pages of paginated results
    async *_pager(endpoint, scopes) {
        let response = await this._get(endpoint);
        yield response.data;

        while (response.paginationToken) {
            response = await this._get(`${endpoint}?page=${response.paginationToken}`);
            yield response.data;
        }
    }

    // Collects all pages of paginated results
    async _collect(endpoint, scopes) {
        let response = await this._get(endpoint);
        let results = response.data;

        while (response.paginationToken) {
            response = await this._get(`${endpoint}?page=${response.paginationToken}`);
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
     * Gets single engine details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-id-GET|docs}).
     * @async
     * @param {string} engineId Fully qualified engine ID.
     * @returns {Promise<object>} Engine details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getEngine(engineId) {
        return this._get(`/engines/${engineId}`);
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
     * Gets single appbundle details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-id-GET|docs}).
     * @async
     * @param {string} bundleId Fully qualified appbundle ID.
     * @returns {Promise<object>} Appbundle details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getAppBundle(bundleId) {
        return this._get(`/appbundles/${bundleId}`);
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
     * @returns {Promise<object>} Details of updated app bundle.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async updateAppBundle(name, engine = undefined, description = undefined) {
        // TODO: tests
        const config = {};
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
     * @returns {Promise<object>} Details of the updated alias.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async updateAppBundleAlias(name, alias, version) {
        // TODO: tests
        const config = { version: version };
        return this._patch(`/appbundles/${name}/aliases/${alias}`, { json: config });
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
     * Gets single activity details
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-GET|docs}).
     * @async
     * @param {string} activityId Fully qualified activity ID.
     * @returns {Promise<object>} Activity details.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getActivity(activityId) {
        return this._get(`/activities/${activityId}`);
    }

    _inventorActivityConfig(activityId, description, ownerId, bundleName, bundleAlias, engine, inputs, outputs) {
        const config = {
            commandLine: [`$(engine.path)\\InventorCoreConsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (activityId) {
            config.id = activityId;
        }
        if (inputs.length > 0) {
            config.commandLine[0] += ' /i';
            for (const input of inputs) {
                config.commandLine[0] += ` $(args[${input.name}].path)`;
                config.parameters[input.name] = { verb: 'get' };
                if (input.description) {
                    config.parameters[input.name].description = input.description;
                }
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
        return config;
    }

    _revitActivityConfig(activityId, description, ownerId, bundleName, bundleAlias, engine, inputs, outputs) {
        const config = {
            id: activityId,
            commandLine: [`$(engine.path)\\revitcoreconsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (inputs.length > 0) {
            config.commandLine[0] += ' /i';
            for (const input of inputs) {
                config.commandLine[0] += ` $(args[${input.name}].path)`;
                config.parameters[input.name] = { verb: 'get' };
                if (input.description) {
                    config.parameters[input.name].description = input.description;
                }
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
        return config;
    }

    _autocadActivityConfig(activityId, description, ownerId, bundleName, bundleAlias, engine, inputs, outputs, script) {
        const config = {
            id: activityId,
            commandLine: [`$(engine.path)\\accoreconsole.exe /al $(appbundles[${bundleName}].path)`],
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (inputs.length > 0) {
            config.commandLine[0] += ' /i';
            for (const input of inputs) {
                config.commandLine[0] += ` $(args[${input.name}].path)`;
                config.parameters[input.name] = { verb: 'get' };
                if (input.description) {
                    config.parameters[input.name].description = input.description;
                }
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
        if (script) {
            config.settings = {
                script: script
            };
            config.commandLine[0] += ' /s $(settings[script].path)';
        }
        return config;
    }

    _3dsmaxActivityConfig(activityId, description, ownerId, bundleName, bundleAlias, engine, inputs, outputs, script) {
        const config = {
            id: activityId,
            commandLine: `$(engine.path)\\3dsmaxbatch.exe`,
            parameters: {},
            description: description,
            engine: engine,
            appbundles: [`${ownerId}.${bundleName}+${bundleAlias}`]
        };
        if (inputs.length > 1) {
            throw new Error('3dsMax engine only supports single input file.')
        } else if (inputs.length > 0) {
            const input = inputs[0];
            config.parameters[input.name] = { verb: 'get' };
            config.commandLine += ` -sceneFile \"$(args[${input.name}].path)\"`;
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
     * @param {object[]} inputs List of input descriptor objects, each containing properties `name` and `description`.
     * @param {object[]} outputs List of output descriptor objects, each containing properties `name` and `description`,
     * and optionally `localName`.
     * @param {string} [script] Optional engine-specific script to pass to the activity.
     * @returns {Promise<object>} Details of created activity.
     */
    async createActivity(id, description, bundleName, bundleAlias, engine, inputs, outputs, script) {
        // TODO: tests
        const engineUri = new DesignAutomationURI(engine);
        let config;
        switch (engineUri.name) {
            case 'AutoCAD':
                config = this._autocadActivityConfig(id, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs, script);
                break;
            case '3dsMax':
                config = this._3dsmaxActivityConfig(id, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs, script)
                break;
            case 'Revit':
                config = this._revitActivityConfig(id, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs);
                break;
            case 'Inventor':
                config = this._inventorActivityConfig(id, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs);
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
     * @param {object[]} inputs List of input descriptor objects, each containing properties `name` and `description`.
     * @param {object[]} outputs List of output descriptor objects, each containing properties `name` and `description`,
     * and optionally `localName`.
     * @param {string} [script] Optional engine-specific script to pass to the activity.
     * @returns {Promise<object>} Details of created activity.
     */
    async updateActivity(id, description, bundleName, bundleAlias, engine, inputs, outputs, script) {
        // TODO: tests
        const engineUri = new DesignAutomationURI(engine);
        let config;
        switch (engineUri.name) {
            case 'AutoCAD':
                config = this._autocadActivityConfig(null, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs, script);
                break;
            case '3dsMax':
                config = this._3dsmaxActivityConfig(null, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs, script)
                break;
            case 'Revit':
                config = this._revitActivityConfig(null, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs);
                break;
            case 'Inventor':
                config = this._inventorActivityConfig(null, description, this.auth.client_id, bundleName, bundleAlias, engine, inputs, outputs);
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
     * @yields {Promise<object[]>} List of activity alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateActivityAliases(name) {
        for await (const aliases of this._pager(`/activities/${name}/aliases`, ReadScopes)) {
            yield aliases;
        }
    }

    /**
     * Gets a list of all activity aliases
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-aliases-GET|docs}).
     * @async
     * @param {string} name Unique name of activity.
     * @returns {Promise<object[]>} List of activity alias objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listActivityAliases(name) {
        return this._collect(`/activities/${name}/aliases`, ReadScopes);
    }

    /**
     * Iterates over all activity versions in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-GET|docs}).
     * @async
     * @generator
     * @param {string} name Unique name of activity.
     * @yields {Promise<object[]>} List of activity versions.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateActivityVersions(name) {
        for await (const versions of this._pager(`/activities/${name}/versions`, ReadScopes)) {
            yield versions;
        }
    }

    /**
     * Gets a list of all activity versions
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-id-versions-GET|docs}).
     * @async
     * @param {string} name Unique name of activity.
     * @returns {Promise<object[]>} List of activity versions.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listActivityVersions(name) {
        return this._collect(`/activities/${name}/versions`, ReadScopes);
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
     * @returns {Promise<object>} Details of updated alias.
     */
    async updateActivityAlias(id, alias, version) {
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
    async workItemDetails(id) {
        return this._get(`/workitems/${id}`);
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
        return this._post('/workitems', { json: config });
    }
}

module.exports = {
    DesignAutomationClient
};
