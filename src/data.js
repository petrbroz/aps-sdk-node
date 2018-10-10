const querystring = require('querystring');

const { get, post, put } = require('./request');
const { AuthenticationClient } = require('./auth');

const RootPath = '/oss/v2';
const ReadTokenScopes = ['bucket:read', 'data:read'];
const WriteTokenScopes = ['bucket:create', 'data:write'];

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/data/v2|data management APIs}.
 * @tutorial data-basic
 */
class DataManagementClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * @param {AuthenticationClient} auth Authentication client used to obtain tokens
     * for data management requests.
     */
    constructor(auth) {
        this.auth = auth;
    }

    // Bucket APIs

    /**
     * Gets a paginated list of all buckets
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
     * @async
     * @generator
     * @param {number} [page] Max number of buckets to obtain in one yield.
     * @yields {Promise<object[]>} List of bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *buckets(page = 16) {
        let authentication = await this.auth.authenticate(ReadTokenScopes);
        let response = await get(`${RootPath}/buckets?limit=${page}`, { 'Authorization': 'Bearer ' + authentication.access_token });
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            authentication = await this.auth.authenticate(ReadTokenScopes);
            response = await get(`${RootPath}/buckets?startAt=${startAt}&limit=${page}`, { 'Authorization': 'Bearer ' + authentication.access_token });
            yield response.items;
        }
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
        const response = await get(`${RootPath}/buckets/${bucket}/details`, { 'Authorization': 'Bearer ' + authentication.access_token });
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
        const response = await post(`${RootPath}/buckets`, { json: params }, { 'Authorization': 'Bearer ' + authentication.access_token });
        return response;
    }

    // Object APIs

    /**
     * Gets a paginated list of all objects in a bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
     * @async
     * @generator
     * @param {string} bucket Bucket key.
     * @param {number} [page] Max number of objects to obtain in one yield.
     * @yields {Promise<object[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *objects(bucket, page = 16) {
        let authentication = await this.auth.authenticate(ReadTokenScopes);
        let response = await get(`${RootPath}/buckets/${bucket}/objects?limit=${page}`, { 'Authorization': 'Bearer ' + authentication.access_token });
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            authentication = await this.auth.authenticate(ReadTokenScopes);
            response = await get(`${RootPath}/buckets/${bucket}/objects?startAt=${startAt}&limit=${page}`, { 'Authorization': 'Bearer ' + authentication.access_token });
            yield response.items;
        }
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
        });
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
        }, false);
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
        const response = await get(`${RootPath}/buckets/${bucket}/objects/${object}/details`, { 'Authorization': 'Bearer ' + authentication.access_token });
        return response;
    }
}

module.exports = {
    DataManagementClient
};