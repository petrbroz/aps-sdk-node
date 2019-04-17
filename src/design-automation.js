const { get, post, put } = require('./request');
const { AuthenticationClient } = require('./auth');

const RootPath = '/da/us-east/v3';
const ReadScopes = ['code:all'];

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/design-automation/v3|design automation APIs}.
 * @tutorial design-automation-basic
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

    /**
     * Gets a paginated list of all engines
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/engines-GET|docs}).
     * @async
     * @generator
     * @yields {Promise<object[]>} List of engines.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *engines() {
        let authentication = await this.auth.authenticate(ReadScopes);
        let response = await get(`${RootPath}/engines`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        yield response.data;

        while (response.paginationToken) {
            authentication = await this.auth.authenticate(ReadScopes);
            response = await get(`${RootPath}/engines?page=${response.paginationToken}`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
            yield response.data;
        }
    }

    /**
     * Gets a paginated list of all appbundles
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-GET|docs}).
     * @async
     * @generator
     * @yields {Promise<object[]>} List of appbundle object.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *appbundles() {
        let authentication = await this.auth.authenticate(ReadScopes);
        let response = await get(`${RootPath}/appbundles`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        yield response.data;

        while (response.paginationToken) {
            authentication = await this.auth.authenticate(ReadScopes);
            response = await get(`${RootPath}/appbundles?page=${response.paginationToken}`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
            yield response.data;
        }
    }

    /**
     * Creates a new app bundle
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/appbundles-POST|docs}).
     * @async
     * @param {string} name Unique name of the bundle.
     * @param {string} description Bundle description.
     * @param {string} engine ID of one of the supported {@link engines}.
     * @returns {Promise<object>} Details of created app bundle.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async createAppBundle(name, description, engine) {
        const authentication = await this.auth.authenticate(ReadScopes);
        const config = { id: name, description: description, engine: engine };
        const response = await post(`${RootPath}/appbundles`, { json: config }, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        return response;
    }

    /**
     * Gets a paginated list of all activities
     * ({@link https://forge.autodesk.com/en/docs/design-automation/v3/reference/http/activities-GET|docs}).
     * @async
     * @generator
     * @yields {Promise<object[]>} List of activities.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *activities() {
        let authentication = await this.auth.authenticate(ReadScopes);
        let response = await get(`${RootPath}/activities`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        yield response.data;

        while (response.paginationToken) {
            authentication = await this.auth.authenticate(ReadScopes);
            response = await get(`${RootPath}/activities?page=${response.paginationToken}`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
            yield response.data;
        }
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
        const response = await get(`${RootPath}/workitems/${id}`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        return response;
    }
}

module.exports = {
    DesignAutomationClient
};
