const querystring = require('querystring');

const { get, post, put } = require('./request');
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
     * @param {string} [host="developer.api.autodesk.com"] Forge API host.
     * for data management requests.
     */
    constructor(auth, host) {
        this.auth = auth;
        this.host = host;
    }

    // Iterates (asynchronously) over pages of paginated results
    async *_pager(endpoint, page, scopes) {
        let authentication = await this.auth.authenticate(scopes);
        let headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        let response = await get(`${RootPath}${endpoint}?limit=${page}`, headers, true, this.host);
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
            response = await get(`${RootPath}${endpoint}?startAt=${startAt}&limit=${page}`, headers, true, this.host);
            yield response.items;
        }
    }

    // Collects all pages of paginated results
    async _collect(endpoint, scopes) {
        let authentication = await this.auth.authenticate(scopes);
        let headers = { 'Authorization': 'Bearer ' + authentication.access_token };
        let response = await get(`${RootPath}${endpoint}`, headers, true, this.host);
        let results = response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
            response = await get(`${RootPath}${endpoint}?startAt=${startAt}`, headers, true, this.host);
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
     * @param {number} [page] Max number of buckets to obtain in one yield.
     * @yields {Promise<object[]>} List of bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *bucketsPager(page = 16) {
        for await (const buckets of this._pager('/buckets', page, ReadTokenScopes)) {
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
    async buckets() {
        return this._collect('/buckets', ReadTokenScopes);
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
    async bucketDetails(bucket) {
        const authentication = await this.auth.authenticate(ReadTokenScopes);
        const response = await get(`${RootPath}/buckets/${bucket}/details`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        return response;
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
        const authentication = await this.auth.authenticate(WriteTokenScopes);
        const params = {
            bucketKey: bucket,
            policyKey: dataRetention
        };
        const response = await post(`${RootPath}/buckets`, { json: params }, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        return response;
    }

    // Object APIs

    /**
     * Iterates over all objects in a bucket in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
     * @async
     * @generator
     * @param {string} bucket Bucket key.
     * @param {number} [page] Max number of objects to obtain in one yield.
     * @yields {Promise<object[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *objectsPager(bucket, page = 16) {
        for await (const objects of this._pager(`/buckets/${bucket}/objects`, page, ReadTokenScopes)) {
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
    async objects(bucket) {
        return this._collect(`/buckets/${bucket}/objects`, ReadTokenScopes);
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
        const authentication = await this.auth.authenticate(WriteTokenScopes);
        const response = await put(`${RootPath}/buckets/${bucket}/objects/${name}`, data, {
            'Authorization': 'Bearer ' + authentication.access_token,
            'Content-Type': contentType
        }, true, this.host);
        return response;
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
        const authentication = await this.auth.authenticate(ReadTokenScopes);
        const response = await get(`${RootPath}/buckets/${bucket}/objects/${object}`, {
            'Authorization': 'Bearer ' + authentication.access_token,
        }, false, this.host);
        return response;
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
    async objectDetails(bucket, object) {
        const authentication = await this.auth.authenticate(ReadTokenScopes);
        const response = await get(`${RootPath}/buckets/${bucket}/objects/${object}/details`, { 'Authorization': 'Bearer ' + authentication.access_token }, true, this.host);
        return response;
    }
}

module.exports = {
    DataManagementClient
};
