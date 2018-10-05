const querystring = require('querystring');

const { get } = require('./request');
const { AuthenticationClient } = require('./auth');

const ReadTokenScopes = ['bucket:read', 'data:read'];

/**
 * Client providing access to Autodesk Forge data management APIs.
 * {@link https://forge.autodesk.com/en/docs/data/v2}
 */
class DataManagementClient {
    /**
     * Initializes new client with specific Forge app credentials.
     * @param {AuthenticationClient} [auth] Authentication client used to obtain tokens
     * for data management requests.
     */
    constructor(auth) {
        this.auth = auth;
    }

    /**
     * Gets a list of all buckets.
     * @async
     * @param {number} [page] Max number of buckets to obtain in one request.
     * @yields {object} Bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
     * {@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET}
     */
    async *buckets(page = 16) {
        let access_token = await this.auth.authenticate(ReadTokenScopes);
        let response = await get(`/oss/v2/buckets?limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
        for (const bucket of response.items) {
            yield bucket;
        }

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            access_token = await this.auth.authenticate(ReadTokenScopes);
            response = await get(`/oss/v2/buckets?startAt=${startAt}&limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
            for (const bucket of response.items) {
                yield bucket;
            }
        }
    }

    /**
     * Gets a list of all objects in a bucket.
     * @async
     * @param {string} bucket Bucket key.
     * @param {number} [page] Max number of objects to obtain in one request.
     * @yields {object} Object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * {@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET}
     */
    async *objects(bucket, page = 16) {
        const access_token = await this.auth.authenticate(ReadTokenScopes);
        let response = await get(`/oss/v2/buckets/${bucket}/objects?limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
        for (const obj of response.items) {
            yield obj;
        }

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt'));
            response = await get(`/oss/v2/buckets/${bucket}/objects?startAt=${startAt}&limit=${page}`, { 'Authorization': 'Bearer ' + access_token });
            for (const obj of response.items) {
                yield obj;
            }
        }
    }
}

module.exports = {
    DataManagementClient
};