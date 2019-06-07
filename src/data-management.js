const querystring = require('querystring');

const { get, post, put, DefaultHost, TwoLeggedAuth, ThreeLeggedAuth, rawFetch } = require('./common');
const { AuthenticationClient } = require('./authentication');

const RootPath = '/oss/v2';
const ReadTokenScopes = ['bucket:read', 'data:read'];
const WriteTokenScopes = ['bucket:create', 'data:write'];

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/data/v2|data management APIs}.
 * @tutorial data-management
 */
class DataManagementClient {
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
    async _get(endpoint, headers = {}, scopes = ReadTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return get(this.host + RootPath + endpoint, headers);
    }

    // Helper method for POST requests
    async _post(endpoint, data, headers = {}, scopes = WriteTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return post(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for PUT requests
    async _put(endpoint, data, headers = {}, scopes = WriteTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return put(this.host + RootPath + endpoint, data, headers);
    }

    // Iterates (asynchronously) over pages of paginated results
    async *_pager(endpoint, limit) {
        let response = await this._get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}limit=${limit}`);
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            response = await this._get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}startAt=${startAt}&limit=${limit}`);
            yield response.items;
        }
    }

    // Collects all pages of paginated results
    async _collect(endpoint) {
        let response = await this._get(endpoint);
        let results = response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            response = await this._get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}startAt=${startAt}`);
            results = results.concat(response.items);
        }
        return results;
    }

    // Bucket APIs

    /**
     * Iterates over all buckets in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
     * @async
     * @generator
     * @param {number} [limit=16] Max number of buckets to receive in one batch (allowed values: 1-100).
     * @yields {Promise<object[]>} List of bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateBuckets(limit = 16) {
        for await (const buckets of this._pager('/buckets', limit)) {
            yield buckets;
        }
    }

    /**
     * Lists all buckets
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
     * @async
     * @returns {Promise<object[]>} List of bucket objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listBuckets() {
        return this._collect('/buckets');
    }

    /**
     * Gets details of a specific bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-details-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @returns {Promise<object>} Bucket details, with properties "bucketKey", "bucketOwner", "createdDate",
     * "permissions", and "policyKey".
     * @throws Error when the request fails, for example, due to insufficient rights, or when a bucket
     * with this name does not exist.
     */
    async getBucketDetails(bucket) {
        return this._get(`/buckets/${bucket}/details`);
    }

    /**
     * Creates a new bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-POST|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} dataRetention One of the following: transient, temporary, permanent.
     * @returns {Promise<object>} Bucket details, with properties "bucketKey", "bucketOwner", "createdDate",
     * "permissions", and "policyKey".
     * @throws Error when the request fails, for example, due to insufficient rights, incorrect scopes,
     * or when a bucket with this name already exists.
     */
    async createBucket(bucket, dataRetention) {
        const params = { bucketKey: bucket, policyKey: dataRetention };
        return this._post('/buckets', { json: params });
    }

    // Object APIs

    /**
     * Iterates over all objects in a bucket in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
     * @async
     * @generator
     * @param {string} bucket Bucket key.
     * @param {number} [limit=16] Max number of objects to receive in one batch (allowed values: 1-100).
     * @param {string} [beginsWith] Optional filter to only return objects whose keys are prefixed with this value.
     * @yields {Promise<object[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateObjects(bucket, limit = 16, beginsWith) {
        let url = `/buckets/${bucket}/objects`;
        if (beginsWith) {
            url += '?beginsWith=' + querystring.escape(beginsWith);
        }
        for await (const objects of this._pager(url, limit)) {
            yield objects;
        }
    }

    /**
     * Lists all objects in a bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} [beginsWith] Optional filter to only return objects whose keys are prefixed with this value.
     * @returns {Promise<object[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listObjects(bucket, beginsWith) {
        let url = `/buckets/${bucket}/objects`;
        if (beginsWith) {
            url += '?beginsWith=' + querystring.escape(beginsWith);
        }
        return this._collect(url);
    }

    /**
     * Uploads content to a specific bucket object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-PUT|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} name Name of uploaded object.
     * @param {string} contentType Type of content to be used in HTTP headers, for example, "application/json".
     * @param {Buffer} data Object content.
     * @returns {Promise<object>} Object description containing 'bucketKey', 'objectKey', 'objectId',
     * 'sha1', 'size', 'location', and 'contentType'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async uploadObject(bucket, name, contentType, data) {
        // TODO: add support for large file uploads using "PUT buckets/:bucketKey/objects/:objectName/resumable"
        return this._put(`/buckets/${bucket}/objects/${name}`, { buffer: data }, { 'Content-Type': contentType });
    }

    /**
     * Uploads content to a specific bucket object using the resumable capabilities
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-resumable-PUT|docs}).
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectName Name of uploaded object.
     * @param {Buffer} data Object content.
     * @param {number} byteOffset Byte offset of the uploaded blob in the target object.
     * @param {number} totalBytes Total byte size of the target object.
     * @param {string} sessionId Resumable session ID.
     * @param {string} [contentType='application/stream'] Type of content to be used in HTTP headers, for example, "application/json".
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async uploadObjectResumable(bucketKey, objectName, data, byteOffset, totalBytes, sessionId, contentType = 'application/stream') {
        // TODO: get rid of rawFetch; add support for disabling 202 retries in put/get methods
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Content-Length': data.byteLength,
                'Content-Range': `bytes ${byteOffset}-${byteOffset + data.byteLength - 1}/${totalBytes}`,
                'Session-Id': sessionId
            },
            body: data
        };
        if (this.auth) {
            const authentication = await this.auth.authenticate(WriteTokenScopes);
            options.headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            options.headers['Authorization'] = 'Bearer ' + this.token;
        }
        const response = await rawFetch(this.host + RootPath + `/buckets/${bucketKey}/objects/${objectName}/resumable`, options);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }
    }

    /**
     * Gets status of a resumable upload session
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-status-:sessionId-GET|docs}).
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectName Name of uploaded object.
     * @param {string} sessionId Resumable session ID.
     * @returns {Promise<object[]>} List of range objects, with each object specifying 'start' and 'end' byte offsets
     * of data that has already been uploaded.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getResumableUploadStatus(bucketKey, objectName, sessionId) {
        // TODO: get rid of rawFetch; add support for disabling 202 retries in put/get methods
        const options = { method: 'GET', headers: {} };
        if (this.auth) {
            const authentication = await this.auth.authenticate(ReadTokenScopes);
            options.headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            options.headers['Authorization'] = 'Bearer ' + this.token;
        }
        const response = await rawFetch(this.host + RootPath + `/buckets/${bucketKey}/objects/${objectName}/status/${sessionId}`, options);
        if (response.ok) {
            const ranges = response.headers.get('Range');
            const match = ranges.match(/^bytes=(\d+-\d+(,\d+-\d+)*)$/);
            if (match) {
                return match[1].split(',').map(str => {
                    const tokens = str.split('-');
                    return {
                        start: parseInt(tokens[0]),
                        end: parseInt(tokens[1])
                    };
                });
            } else {
                throw new Error('Unexpected range format: ' + ranges);
            }
        } else {
            const text = await response.text();
            throw new Error(text);
        }
    }

    /**
     * Downloads content of a specific bucket object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} object Object name.
     * @returns {Promise<object>} Object content.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async downloadObject(bucket, object) {
        return this._get(`/buckets/${bucket}/objects/${object}`);
    }

    /**
     * Gets details of a specific bucket object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-details-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} object Object name.
     * @returns {Promise<object>} Object description containing 'bucketKey', 'objectKey', 'objectId',
     * 'sha1', 'size', 'location', and 'contentType'.
     * @throws Error when the request fails, for example, due to insufficient rights, or when an object
     * with this name does not exist.
     */
    async getObjectDetails(bucket, object) {
        return this._get(`/buckets/${bucket}/objects/${object}/details`);
    }

    /**
     * Creates signed URL for specific object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-signed-POST|docs}).
     * @async
     * @param {string} bucketId Bucket key.
     * @param {string} objectId Object key.
     * @param {string} [access="readwrite"] Signed URL access authorization.
     * @returns {Promise<object>} Description of the new signed URL resource.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async createSignedUrl(bucketId, objectId, access = 'readwrite') {
        return this._post(`/buckets/${bucketId}/objects/${objectId}/signed?access=${access}`, { json: {} });
    }
}

module.exports = {
    DataManagementClient
};
