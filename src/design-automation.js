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
            response = await get(`${RootPath}/appbundles?page=${appBundles.paginationToken}`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
            yield response.data;
        }
    }
}

module.exports = {
    DesignAutomationClient
};
