const querystring = require('querystring');

const { get, post, put, DefaultHost } = require('./common');
const { AuthenticationClient } = require('./authentication');

const RootPath = '/oss/v2';
const ReadTokenScopes = ['bucket:read', 'data:read'];
const WriteTokenScopes = ['bucket:create', 'data:write'];

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/data/v2|data management APIs}.
 * @tutorial data-management
 */
class DataManagementClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * @param {AuthenticationClient} auth Authentication client used to obtain tokens
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * for data management requests.
     */
    constructor(auth, host = DefaultHost) {
        this.auth = auth;
        this.host = host;
    }

    // Helper method for GET requests with two-legged auth (read scope)
    async _get(endpoint, headers = {}, scopes = ReadTokenScopes) {
        const authentication = await this.auth.authenticate(scopes);
        headers['Authorization'] = 'Bearer ' + authentication.access_token;
        return get(this.host + RootPath + endpoint, headers);
    }

    // Helper method for POST requests with two-legged auth (write scope)
    async _post(endpoint, data, headers = {}, scopes = WriteTokenScopes) {
        const authentication = await this.auth.authenticate(scopes);
        headers['Authorization'] = 'Bearer ' + authentication.access_token;
        return post(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for PUT requests with two-legged auth (write scope)
    async _put(endpoint, data, headers = {}, scopes = WriteTokenScopes) {
        const authentication = await this.auth.authenticate(scopes);
        headers['Authorization'] = 'Bearer ' + authentication.access_token;
        return put(this.host + RootPath + endpoint, data, headers);
    }

    // Iterates (asynchronously) over pages of paginated results
    async *_pager(endpoint, limit) {
        let response = await this._get(`${endpoint}?limit=${limit}`);
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            response = await this._get(`${endpoint}?startAt=${startAt}&limit=${limit}`);
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
            response = await this._get(`${endpoint}?startAt=${startAt}`);
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
     * @param {number} [limit=16] Max number of buckets to receive in one batch.
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
     * @param {number} [limit=16] Max number of objects to receive in one batch.
     * @yields {Promise<object[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateObjects(bucket, limit = 16) {
        for await (const objects of this._pager(`/buckets/${bucket}/objects`, limit)) {
            yield objects;
        }
    }

    /**
     * Lists all objects in a bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @returns {Promise<object[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listObjects(bucket) {
        return this._collect(`/buckets/${bucket}/objects`);
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
