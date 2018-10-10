const { get, post, put } = require('./request');
const { AuthenticationClient } = require('./auth');

const RootPath = '/modelderivative/v2';
const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:read', 'data:write', 'data:create'];

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/model-derivative/v2|model derivative APIs}.
 * @tutorial deriv-basic
 */
class ModelDerivativeClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * @param {AuthenticationClient} auth Authentication client used to obtain tokens
     * for all requests.
     */
    constructor(auth) {
        this.auth = auth;
    }

    /**
     * Gets a list of supported translation formats.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/formats-GET|docs}).
     * @async
     * @yields {Promise<object>} Dictionary of all supported output formats
     * mapped to arrays of formats these outputs can be obtained from.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async formats() {
        const authentication = await this.auth.authenticate(ReadTokenScopes);
        const response = await get(`${RootPath}/designdata/formats`, { 'Authorization': 'Bearer ' + authentication.access_token });
        return response.formats;
    }

    /**
     * Submits a translation job
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/job-POST|docs}).
     * @async
     * @param {string} urn Document to be translated.
     * @param {object[]} outputs List of requested output formats. Currently the one
     * supported format is `{ type: 'svf', views: ['2d', '3d'] }`.
     * @returns {Promise<object>} Translation job details, with properties 'result',
     * 'urn', and 'acceptedJobs'.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async submitJob(urn, outputs) {
        const authentication = await this.auth.authenticate(WriteTokenScopes);
        const params = {
            input: {
                urn: urn
            },
            output: {
                formats: outputs
            }
        };
        const response = await post(`${RootPath}/designdata/job`, { json: params }, { 'Authorization': 'Bearer ' + authentication.access_token });
        return response;
    }
}

module.exports = {
    ModelDerivativeClient
};