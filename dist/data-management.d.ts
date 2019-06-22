/// <reference types="node" />
import { IAuthOptions } from './common';
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
export declare enum DataRetentionPolicy {
    Transient = "transient",
    Temporary = "temporary",
    Persistent = "persistent"
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
export declare class DataManagementClient {
    private auth?;
    private token?;
    private host;
    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth: IAuthOptions, host?: string);
    private _get;
    private _post;
    private _put;
    private _pager;
    private _collect;
    /**
     * Iterates over all buckets in pages of predefined size
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
     * @async
     * @generator
     * @param {number} [limit=16] Max number of buckets to receive in one batch (allowed values: 1-100).
     * @yields {AsyncIterable<IBucket[]>} List of bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    iterateBuckets(limit?: number): AsyncIterable<IBucket[]>;
    /**
     * Lists all buckets
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
     * @async
     * @returns {Promise<IBucket[]>} List of bucket objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listBuckets(): Promise<IBucket[]>;
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
    getBucketDetails(bucket: string): Promise<IBucketDetail>;
    /**
     * Creates a new bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-POST|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {DataRetentionPolicy} dataRetention Data retention policy for objects uploaded to this bucket.
     * @returns {Promise<IBucketDetail>} Bucket details, with properties "bucketKey", "bucketOwner", "createdDate",
     * "permissions", and "policyKey".
     * @throws Error when the request fails, for example, due to insufficient rights, incorrect scopes,
     * or when a bucket with this name already exists.
     */
    createBucket(bucket: string, dataRetention: DataRetentionPolicy): Promise<IBucketDetail>;
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
    iterateObjects(bucket: string, limit?: number, beginsWith?: string): AsyncIterable<IObject[]>;
    /**
     * Lists all objects in a bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} [beginsWith] Optional filter to only return objects whose keys are prefixed with this value.
     * @returns {Promise<IObject[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    listObjects(bucket: string, beginsWith?: string): Promise<IObject[]>;
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
    uploadObject(bucket: string, name: string, contentType: string, data: Buffer): Promise<IObject>;
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
    uploadObjectResumable(bucketKey: string, objectName: string, data: Buffer, byteOffset: number, totalBytes: number, sessionId: string, contentType?: string): Promise<void>;
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
    getResumableUploadStatus(bucketKey: string, objectName: string, sessionId: string): Promise<IResumableUploadRange[]>;
    /**
     * Downloads content of a specific bucket object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-GET|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} object Object name.
     * @returns {Promise<ArrayBuffer>} Object content.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    downloadObject(bucket: string, object: string): Promise<ArrayBuffer>;
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
    getObjectDetails(bucket: string, object: string): Promise<IObject>;
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
    createSignedUrl(bucketId: string, objectId: string, access?: string): Promise<ISignedUrl>;
}
//# sourceMappingURL=data-management.d.ts.map