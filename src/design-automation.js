const { get, post, put } = require('./request');
const { AuthenticationClient } = require('./auth');

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
    async *enginesPager() {
        return this._pager('/engines', ReadScopes);
    }

    /**
     * Gets a list of all engines
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of engines.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async engines() {
        return this._collect('/engines', ReadScopes);
    }

    /**
     * Iterates over all app bundles in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @generator
     * @yields {Promise<object[]>} List of appbundle object.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *appBundlesPager() {
        return this._pager('/appbundles', ReadScopes);
    }

    /**
     * Gets a list of all appbundles
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of appbundle object.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async appBundles() {
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

    // TODO: comments
    // TODO: tests
    // TODO: maybe consolidate createAppBundle and createAppBundleVersion into one method
    async createAppBundleVersion(name, engine = undefined, description = undefined) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = {};
        if (description) config.description = description;
        if (engine) config.engine = engine;
        const response = await post(`${RootPath}/appbundles/${name}/versions`, { json: config }, headers, true, this.host);
        return response;
    }

    // TODO: comments
    // TODO: tests
    async createAppBundleAlias(name, alias, version) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = { id: alias, version: version };
        const response = await post(`${RootPath}/appbundles/${name}/aliases`, { json: config }, headers, true, this.host);
        return response;
    }

    // TODO: comments
    // TODO: tests
    // TODO: maybe consolidate createAppBundleAlias and updateAppBundleAlias into one method
    async updateAppBundleAlias(name, alias, version) {
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
    async *activitiesPager() {
        return this._pager('/activities', ReadScopes);
    }

    /**
     * Gets a list of all activities
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of activities.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async activities() {
        return this._collect('/activities', ReadScopes);
    }

    // TODO: comments
    // TODO: tests
    // TODO: flatten the config object
    async createActivity(config) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        // const activityConfig = {
        //     id: ACTIVITY_ID,
        //     commandLine: [`$(engine.path)\\InventorCoreConsole.exe /i $(args[inputFile].path) /al $(appbundles[${APPBUNDLE_NAME}].path) $(args[paramsFile].path) $(args[modulesFile].path)`],
        //     parameters: {
        //         inputFile: { verb: 'get', description: '*.iam file to populate with modules.' },
        //         paramsFile: { verb: 'get', description: '*.json file describing which modules to place where.' },
        //         modulesFile: { verb: 'get', description: '*.zip file with STEP files for all required modules.' },
        //         outputFile: {
        //             verb: 'post',
        //             zip: false,
        //             localName: 'output.zip'
        //         }
        //     },
        //     engine: APPBUNDLE_ENGINE,
        //     appbundles: [appBundle.id + '+' + appBundleAlias.id],
        //     description: APPBUNDLE_DESCRIPTION
        // };
        const response = await post(`${RootPath}/activities`, { json: config }, headers, true, this.host);
        return response;
    }

    // TODO: comments
    // TODO: tests
    // TODO: maybe consolidate createActivity and createActivityVersion into one method
    // TODO: flatten the config object
    async createActivityVersion(id, config) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        // const activityConfig = {
        //     commandLine: [`$(engine.path)\\InventorCoreConsole.exe /i $(args[inputFile].path) /al $(appbundles[${APPBUNDLE_NAME}].path) $(args[paramsFile].path) $(args[modulesFile].path)`],
        //     parameters: {
        //         inputFile: { verb: 'get', description: '*.iam file to populate with modules.' },
        //         paramsFile: { verb: 'get', description: '*.json file describing which modules to place where.' },
        //         modulesFile: { verb: 'get', description: '*.zip file with STEP files for all required modules.' },
        //         outputFile: {
        //             verb: 'post',
        //             zip: false,
        //             localName: 'output.zip'
        //         }
        //     },
        //     engine: APPBUNDLE_ENGINE,
        //     appbundles: [appBundle.id + '+' + appBundleAlias.id],
        //     description: APPBUNDLE_DESCRIPTION
        // };
        const response = await post(`${RootPath}/activities/${id}/versions`, { json: config }, headers, true, this.host);
        return response;
    }

    // TODO: comments
    // TODO: tests
    async createActivityAlias(id, alias, version) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        const config = { id: alias, version: version };
        const response = await post(`${RootPath}/activities/${id}/aliases`, { json: config }, headers, true, this.host);
        return response;
    }

    // TODO: comments
    // TODO: tests
    // TODO: maybe consolidate createActivityAlias and updateActivityAlias into one method
    async updateActivityAlias(id, alias, version) {
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

    // TODO: comments
    // TODO: tests
    // TODO: flatten the config object
    async createWorkItem(config) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        // const config = {
        //     activityId: FULL_ACTIVITY_ID,
        //     arguments: {
        //         inputFile: { url: inputSignedUrl.signedUrl, zip: false },
        //         paramsFile: { url: paramsSignedUrl.signedUrl, zip: false },
        //         modulesFile: {
        //             url: modulesSignedUrl.signedUrl,
        //             localName: 'modules'
        //             // if localName is not provided, DA fails with "failedDownload"...
        //             // if localName is provided, DA fails with "failedInstructions: System.UnauthorizedAccessException: Access to the path 'T:\Aces\Jobs\64fdcc52796845cd9958d91a12c73de2\modules.zip' is denied."
        //         },
        //         outputFile: { url: outputSignedUrl.signedUrl, verb: 'put' }
        //     }
        // };
        const response = await post(`${RootPath}/workitems`, { json: config }, headers, true, this.host);
        return response;
    }
}

module.exports = {
    DesignAutomationClient
};
