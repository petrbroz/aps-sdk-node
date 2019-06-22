"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const authentication_1 = require("./authentication");
const RootPath = '/modelderivative/v2';
const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:read', 'data:write', 'data:create'];
/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/model-derivative/v2|model derivative APIs}.
 * @tutorial model-derivative
 */
class ModelDerivativeClient {
    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth, host = common_1.DefaultHost) {
        if ('client_id' in auth && 'client_secret' in auth) {
            this.auth = new authentication_1.AuthenticationClient(auth.client_id, auth.client_secret, host);
        }
        else if (auth.token) {
            this.token = auth.token;
        }
        else {
            throw new Error('Authentication parameters missing or incorrect.');
        }
        this.host = host;
    }
    // Helper method for GET requests
    async _get(endpoint, headers = {}, scopes = ReadTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        }
        else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return common_1.get(this.host + RootPath + endpoint, headers);
    }
    // Helper method for POST requests
    async _post(endpoint, data, headers = {}, scopes = WriteTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        }
        else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return common_1.post(this.host + RootPath + endpoint, data, headers);
    }
    // Helper method for PUT requests
    async _put(endpoint, data, headers = {}, scopes = WriteTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        }
        else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return common_1.put(this.host + RootPath + endpoint, data, headers);
    }
    /**
     * Gets a list of supported translation formats.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/formats-GET|docs}).
     * @async
     * @yields {Promise<IDerivativeFormats>} Dictionary of all supported output formats
     * mapped to arrays of formats these outputs can be obtained from.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async formats() {
        const response = await this._get('/designdata/formats');
        return response.formats;
    }
    /**
     * Submits a translation job
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/job-POST|docs}).
     * @async
     * @param {string} urn Document to be translated.
     * @param {IDerivativeOutputType[]} outputs List of requested output formats. Currently the one
     * supported format is `{ type: 'svf', views: ['2d', '3d'] }`.
     * @returns {Promise<IJob>} Translation job details, with properties 'result',
     * 'urn', and 'acceptedJobs'.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async submitJob(urn, outputs) {
        const params = {
            input: {
                urn: urn
            },
            output: {
                formats: outputs
            }
        };
        return this._post('/designdata/job', { json: params });
    }
    /**
     * Retrieves manifest of a derivative.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeManifest>} Document derivative manifest.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getManifest(urn) {
        return this._get(`/designdata/${urn}/manifest`);
    }
    /**
     * Retrieves metadata of a derivative.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeMetadata>} Document derivative metadata.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getMetadata(urn) {
        return this._get(`/designdata/${urn}/metadata`);
    }
    /**
     * Retrieves object tree of a specific viewable.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @returns {Promise<IDerivativeTree>} Viewable object tree.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableTree(urn, guid) {
        return this._get(`/designdata/${urn}/metadata/${guid}`);
    }
    /**
     * Retrieves properties of a specific viewable.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @returns {Promise<IDerivativeProps>} Viewable properties.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableProperties(urn, guid) {
        return this._get(`/designdata/${urn}/metadata/${guid}/properties`);
    }
}
exports.ModelDerivativeClient = ModelDerivativeClient;
