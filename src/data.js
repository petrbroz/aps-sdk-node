const querystring = require('querystring');

const { get } = require('./request');
const { AuthenticationClient } = require('./auth');

const RootPath = '/oss/v2';
const ReadTokenScopes = ['bucket:read', 'data:read'];

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/data/v2|data management APIs}.
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
     */
    async *buckets(page = 16) {
        let access_token = await this.auth.authenticate(ReadTokenScopes);
        let response = await get(`${RootPath}/buckets?limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            access_token = await this.auth.authenticate(ReadTokenScopes);
            response = await get(`${RootPath}/buckets?startAt=${startAt}&limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
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
     */
    async bucketDetails(bucket) {
        const access_token = await this.auth.authenticate(ReadTokenScopes);
        const response = await get(`${RootPath}/buckets/${bucket}/details`, { 'Authorization': 'Bearer ' + access_token });
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
     */
    async *objects(bucket, page = 16) {
        const access_token = await this.auth.authenticate(ReadTokenScopes);
        let response = await get(`${RootPath}/buckets/${bucket}/objects?limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            response = await get(`${RootPath}/buckets/${bucket}/objects?startAt=${startAt}&limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
            yield response.items;
        }
    }
}

module.exports = {
    DataManagementClient
};