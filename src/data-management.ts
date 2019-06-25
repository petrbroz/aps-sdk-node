import * as querystring from 'querystring';

import { get, post, put, rawFetch, DefaultHost, IAuthOptions, del } from './common';
import { AuthenticationClient } from './authentication';

const RootPath = '/oss/v2';
const ReadTokenScopes = ['bucket:read', 'data:read'];
const WriteTokenScopes = ['bucket:create', 'data:write'];

export enum Region {
    US = 'US',
    EMEA = 'EMEA'
}

export interface IBucket {
    bucketKey: string;
    createdDate: number;
    policyKey: string;
}

export interface IBucketPermission {
    authId: string;
    access: string;
}

export interface IBucketDetail extends IBucket {
    bucketOwner: string;
    permissions: IBucketPermission[];
}

export enum DataRetentionPolicy {
    Transient = 'transient',
    Temporary = 'temporary',
    Persistent = 'persistent'
}

export interface IObject {
    objectKey: string;
    bucketKey: string;
    objectId: string;
    sha1: string;
    size: number;
    location: string;
}

export interface IResumableUploadRange {
    start: number;
    end: number;
}

export interface ISignedUrl {
    signedUrl: string;
    expiration: number;
    singleUse: boolean;
}

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/data/v2|data management APIs}.
 * @tutorial data-management
 */
export class DataManagementClient {
    private auth?: AuthenticationClient;
    private token?: string;
    private host: string;

    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth: IAuthOptions, host: string = DefaultHost) {
        if ('client_id' in auth && 'client_secret' in auth) {
            this.auth = new AuthenticationClient(auth.client_id, auth.client_secret, host);
        } else if ('token' in auth) {
            this.token = auth.token;
        } else {
            throw new Error('Authentication parameters missing or incorrect.');
        }
        this.host = host;
    }

    // Helper method for GET requests
    private async _get(endpoint: string, headers: { [name: string]: string } = {}, scopes = ReadTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return get(this.host + RootPath + endpoint, headers);
    }

    // Helper method for POST requests
    private async _post(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes = WriteTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return post(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for PUT requests
    private async _put(endpoint: string, data: any, headers: { [name: string]: string } = {}, scopes = WriteTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return put(this.host + RootPath + endpoint, data, headers);
    }

    // Helper method for DELETE requests
    private async _delete(endpoint: string, headers: { [name: string]: string } = {}, scopes = WriteTokenScopes) {
        if (this.auth) {
            const authentication = await this.auth.authenticate(scopes);
            headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            headers['Authorization'] = 'Bearer ' + this.token;
        }
        return del(this.host + RootPath + endpoint, headers);
    }

    // Iterates (asynchronously) over pages of paginated results
    private async *_pager(endpoint: string, limit: number) {
        let response = await this._get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}limit=${limit}`);
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt') || '');
            response = await this._get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}startAt=${startAt}&limit=${limit}`);
            yield response.items;
        }
    }

    // Collects all pages of paginated results
    private async _collect(endpoint: string) {
        let response = await this._get(endpoint);
        let results = response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = querystring.escape(next.searchParams.get('startAt') || '');
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
     * @param {Region} [region='US'] Region to list buckets from ('US' or 'EMEA').
     * @yields {AsyncIterable<IBucket[]>} List of bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateBuckets(limit: number = 16, region: Region = Region.US): AsyncIterable<IBucket[]> {
        for await (const buckets of this._pager(`/buckets?region=${region}`, limit)) {
            yield buckets;
        }
    }

    /**
     * Lists all buckets
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
     * @param {string} [region='US'] Region to list buckets from ('US' or 'EMEA').
     * @async
     * @returns {Promise<IBucket[]>} List of bucket objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listBuckets(region: Region = Region.US): Promise<IBucket[]> {
        return this._collect(`/buckets?region=${region}`);
    }

    /**
     * Gets details of a specific bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-details-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @returns {Promise<IBucketDetail>} Bucket details, with properties "bucketKey", "bucketOwner", "createdDate",
     * "permissions", and "policyKey".
     * @throws Error when the request fails, for example, due to insufficient rights, or when a bucket
     * with this name does not exist.
     */
    async getBucketDetails(bucket: string): Promise<IBucketDetail> {
        return this._get(`/buckets/${bucket}/details`);
    }

    /**
     * Creates a new bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-POST|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {DataRetentionPolicy} dataRetention Data retention policy for objects uploaded to this bucket.
     * @param {Region} [region='US'] Region where the bucket will reside ('US' or 'EMEA').
     * @returns {Promise<IBucketDetail>} Bucket details, with properties "bucketKey", "bucketOwner", "createdDate",
     * "permissions", and "policyKey".
     * @throws Error when the request fails, for example, due to insufficient rights, incorrect scopes,
     * or when a bucket with this name already exists.
     */
    async createBucket(bucket: string, dataRetention: DataRetentionPolicy, region: Region = Region.US): Promise<IBucketDetail> {
        const params = { bucketKey: bucket, policyKey: dataRetention };
        return this._post('/buckets', { json: params }, { 'x-ads-region': region });
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
     * @yields {AsyncIterable<IObject[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateObjects(bucket: string, limit: number = 16, beginsWith?: string): AsyncIterable<IObject[]> {
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
     * @returns {Promise<IObject[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listObjects(bucket: string, beginsWith?: string): Promise<IObject[]> {
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
     * @returns {Promise<IObject>} Object description containing 'bucketKey', 'objectKey', 'objectId',
     * 'sha1', 'size', 'location', and 'contentType'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async uploadObject(bucket: string, name: string, contentType: string, data: Buffer): Promise<IObject> {
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
    async uploadObjectResumable(bucketKey: string, objectName: string, data: Buffer, byteOffset: number, totalBytes: number, sessionId: string, contentType: string = 'application/stream') {
        // TODO: get rid of rawFetch; add support for disabling 202 retries in put/get methods
        const options = {
            method: 'PUT',
            headers: {
                'Authorization': '',
                'Content-Type': contentType,
                'Content-Length': data.byteLength.toString(),
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
     * @returns {Promise<IResumableUploadRange[]>} List of range objects, with each object specifying 'start' and 'end' byte offsets
     * of data that has already been uploaded.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getResumableUploadStatus(bucketKey: string, objectName: string, sessionId: string): Promise<IResumableUploadRange[]> {
        // TODO: get rid of rawFetch; add support for disabling 202 retries in put/get methods
        const options = { method: 'GET', headers: { 'Authorization': '' } };
        if (this.auth) {
            const authentication = await this.auth.authenticate(ReadTokenScopes);
            options.headers['Authorization'] = 'Bearer ' + authentication.access_token;
        } else {
            options.headers['Authorization'] = 'Bearer ' + this.token;
        }
        const response = await rawFetch(this.host + RootPath + `/buckets/${bucketKey}/objects/${objectName}/status/${sessionId}`, options);
        if (response.ok) {
            const ranges = response.headers.get('Range') || '';
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
     * @returns {Promise<ArrayBuffer>} Object content.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async downloadObject(bucket: string, object: string): Promise<ArrayBuffer>  {
        return this._get(`/buckets/${bucket}/objects/${object}`);
    }

    /**
     * Gets details of a specific bucket object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-details-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} object Object name.
     * @returns {Promise<IObject>} Object description containing 'bucketKey', 'objectKey', 'objectId',
     * 'sha1', 'size', 'location', and 'contentType'.
     * @throws Error when the request fails, for example, due to insufficient rights, or when an object
     * with this name does not exist.
     */
    async getObjectDetails(bucket: string, object: string): Promise<IObject> {
        return this._get(`/buckets/${bucket}/objects/${object}/details`);
    }

    /**
     * Creates signed URL for specific object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-signed-POST|docs}).
     * @async
     * @param {string} bucketId Bucket key.
     * @param {string} objectId Object key.
     * @param {string} [access="readwrite"] Signed URL access authorization.
     * @returns {Promise<ISignedUrl>} Description of the new signed URL resource.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async createSignedUrl(bucketId: string, objectId: string, access = 'readwrite'): Promise<ISignedUrl> {
        return this._post(`/buckets/${bucketId}/objects/${objectId}/signed?access=${access}`, { json: {} });
    }

    /**
     * Deletes object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-DELETE|docs}).
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectName Name of object to delete.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async deleteObject(bucketKey: string, objectName: string) {
        return this._delete(`/buckets/${bucketKey}/objects/${objectName}`);
    }
}
