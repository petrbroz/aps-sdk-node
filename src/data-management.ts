import { ForgeClient, IAuthOptions, Region, sleep } from './common';
import { AxiosError, AxiosRequestConfig } from 'axios';

const RootPath = 'oss/v2';
const ReadTokenScopes = ['bucket:read', 'data:read'];
const WriteTokenScopes = ['bucket:create', 'bucket:delete', 'data:write'];

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

export interface IUploadParams {
    urls: string[];
    uploadKey: string;
}

export interface IDownloadParams {
    /** Indicates status of the object */
    status: 'complete' | 'chunked' | 'fallback';
    /** The S3 signed URL to download from. This attribute is returned when the value
     * of the status attribute is complete or fallback (in which case the URL will be
     * an OSS Signed URL instead of an S3 signed URL).
     */
    url?: string;
    /** A map of S3 signed URLs where each key correspond to a specific byte range chunk.
     * This attribute is returned when the value of the status attribute is chunked.
     */
    urls?: { [range: string]: string };
    /** The values for the updatable params that were used in the creation of the returned
     * S3 signed URL (`Content-Type`, `Content-Disposition` & `Cache-Control`).
     */
    params?: object;
    /** The object size in bytes. */
    size?: number;
    /** The calculated SHA-1 hash of the object, if available. */
    sha1?: string;
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

export interface IUploadOptions {
    contentType?: string;
    progress?: (bytesUploaded: number, totalBytes?: number) => void;
    //cancel?: () => boolean;
}

export interface IDownloadOptions {
    contentType?: string;
    progress?: (bytesDownloaded: number, totalBytes?: number) => void;
    //cancel?: () => boolean;
}

type Task = () => Promise<void>;

/**
 * Executes a list of asynchronous tasks, running up to {@see concurrency} tasks at the same time.
 * @param tasks Async tasks to execute.
 * @param concurrency Max number of tasks to run at the same time.
 * @returns Promise that is resolved when all tasks have completed, or rejected when some of the tasks fail.
 */
function parallelize(tasks: Task[], concurrency: number = 5): Promise<void> {
    const queue = tasks.slice();
    let remaining = queue.length;
    return new Promise(function (resolve, reject) {
        function onTaskCompleted() {
            remaining--;
            if (remaining === 0) {
                resolve();
            } else if (queue.length > 0) {
                const task = queue.shift() as Task;
                task().then(onTaskCompleted).catch(onTaskFailed);
            }
        }
        function onTaskFailed(reason: any) {
            reject(reason);
        }
        for (let i = 0; i < concurrency && queue.length > 0; i++) {
            const task = queue.shift() as Task;
            task().then(onTaskCompleted).catch(onTaskFailed);
        }
    });
}

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/data/v2|data management APIs}.
 * @tutorial data-management
 */
export class DataManagementClient extends ForgeClient {
    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region ("US" or "EMEA").
     */
    constructor(auth: IAuthOptions, host?: string, region?: Region) {
        super(RootPath, auth, host, region);
    }

    // Iterates (asynchronously) over pages of paginated results
    private async *_pager(endpoint: string, limit: number) {
        let response = await this.get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}limit=${limit}`, {}, ReadTokenScopes);
        yield response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = next.searchParams.get('startAt') || '';
            response = await this.get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}startAt=${encodeURIComponent(startAt)}&limit=${limit}`, {}, ReadTokenScopes);
            yield response.items;
        }
    }

    // Collects all pages of paginated results
    private async _collect(endpoint: string) {
        let response = await this.get(endpoint, {}, ReadTokenScopes);
        let results = response.items;

        while (response.next) {
            const next = new URL(response.next);
            const startAt = next.searchParams.get('startAt') || '';
            response = await this.get(`${endpoint}${endpoint.indexOf('?') === -1 ? '?' : '&'}startAt=${encodeURIComponent(startAt)}`, {}, ReadTokenScopes);
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
     * @yields {AsyncIterable<IBucket[]>} List of bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async *iterateBuckets(limit: number = 16): AsyncIterable<IBucket[]> {
        for await (const buckets of this._pager(`buckets?region=${this.region}`, limit)) {
            yield buckets;
        }
    }

    /**
     * Lists all buckets
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
     * @async
     * @returns {Promise<IBucket[]>} List of bucket objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async listBuckets(): Promise<IBucket[]> {
        return this._collect(`buckets?region=${this.region}`);
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
        return this.get(`buckets/${bucket}/details`, {}, ReadTokenScopes);
    }

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
    async createBucket(bucket: string, dataRetention: DataRetentionPolicy): Promise<IBucketDetail> {
        const params = { bucketKey: bucket, policyKey: dataRetention };
        return this.post('buckets', params, { 'x-ads-region': this.region }, WriteTokenScopes);
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
        let url = `buckets/${bucket}/objects`;
        if (beginsWith) {
            url += '?beginsWith=' + beginsWith;
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
        let url = `buckets/${bucket}/objects`;
        if (beginsWith) {
            url += '?beginsWith=' + encodeURIComponent(beginsWith);
        }
        return this._collect(url);
    }

    /**
     * Generates one or more signed URLs that can be used to upload a file (or its parts) to OSS,
     * and an upload key that is used to generate additional URLs or in {@see completeUpload}
     * after all the parts have been uploaded successfully.
     *
     * The URLs are valid for 60min.
     *
     * Note that if you are uploading in multiple parts, each part except for the final one
     * must be of size at least 5MB, otherwise the call to {@see completeUpload} will fail.
     *
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Object key.
     * @param {number} [parts=1] How many URLs to generate in case of multi-part upload.
     * @param {number} [firstPart=1] Index of the part the first returned URL should point to.
     * For example, to upload parts 10 through 15 of a file, use `firstPart` = 10 and `parts` = 6.
     * @param {string} [uploadKey] Optional upload key if this is a continuation of a previously
     * initiated upload.
     * @returns {IUploadParams} Signed URLs for uploading chunks of the file to AWS S3 (valid for 60min),
     * and a unique upload key used to generate additional URLs or to complete the upload.
     */
    async getUploadUrls(bucketKey: string, objectKey: string, parts: number = 1, firstPart: number = 1, uploadKey?: string): Promise<IUploadParams> {
        let endpoint = `buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload?parts=${parts}&firstPart=${firstPart}`;
        if (uploadKey) {
            endpoint += `&uploadKey=${uploadKey}`;
        }
        return this.get(endpoint, { 'Content-Type': 'application/json' }, WriteTokenScopes);
    }

    /**
     * Finalizes the upload of a file to OSS.
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Object key.
     * @param {string} uploadKey Upload key returned by {@see getUploadUrls}.
     * @param {string} [contentType] Optinal content type that should be recorded for the uploaded file.
     * @returns {IObject} Details of the uploaded object in OSS.
     */
    async completeUpload(bucketKey: string, objectKey: string, uploadKey: string, contentType?: string): Promise<IObject> {
        const headers: { [header: string]: string } = { 'Content-Type': 'application/json' };
        if (contentType) {
            headers['x-ads-meta-Content-Type'] = contentType;
        }
        return this.post(`buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3upload`, { uploadKey }, headers, WriteTokenScopes);
    }

    /**
     * Uploads content to a specific bucket object.
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Name of uploaded object.
     * @param {Buffer} data Object content.
     * @param {IUploadOptions} [options] Additional upload options.
     * @returns {Promise<IObject>} Object description containing 'bucketKey', 'objectKey', 'objectId',
     * 'sha1', 'size', 'location', and 'contentType'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async uploadObject(bucketKey: string, objectKey: string, data: Buffer, options?: IUploadOptions): Promise<IObject> {
        console.assert(data.byteLength > 0);
        const ChunkSize = 5 << 20;
        const MaxBatches = 25;
        const totalParts = Math.ceil(data.byteLength / ChunkSize);
        let partsUploaded = 0;
        let bytesUploaded = 0;
        let uploadUrls: string[] = [];
        let uploadKey: string | undefined;
        while (partsUploaded < totalParts) {
            const chunk = data.slice(partsUploaded * ChunkSize, Math.min((partsUploaded + 1) * ChunkSize, data.byteLength));
            while (true) {
                if (uploadUrls.length === 0) {
                    const uploadParams = await this.getUploadUrls(bucketKey, objectKey, Math.min(totalParts - partsUploaded, MaxBatches), partsUploaded + 1, uploadKey); // Automatically retries 429 and 500-599 responses
                    uploadUrls = uploadParams.urls.slice();
                    uploadKey = uploadParams.uploadKey;
                }
                const url = uploadUrls.shift() as string;
                try {
                    await this.axios.put(url, chunk);
                    break;
                } catch (err) {
                    const status = (err as AxiosError).response?.status as number;
                    if (status === 403) {
                        uploadUrls = []; // Couldn't this cause an infinite loop? (i.e., could the server keep responding with 403 indefinitely?)
                    } else {
                        throw err;
                    }
                }
            }
            partsUploaded++;
            bytesUploaded += chunk.byteLength;
            if (options?.progress) {
                options.progress(bytesUploaded, data.byteLength);
            }
        }
        return this.completeUpload(bucketKey, objectKey, uploadKey as string, options?.contentType);
    }

    /**
     * Uploads content stream to a specific bucket object.
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Name of uploaded object.
     * @param {AsyncIterable<Buffer>} stream Input stream.
     * @param {IUploadOptions} [options] Additional upload options.
     * @returns {Promise<IObject>} Object description containing 'bucketKey', 'objectKey', 'objectId',
     * 'sha1', 'size', 'location', and 'contentType'.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async uploadObjectStream(bucketKey: string, objectKey: string, input: AsyncIterable<Buffer>, options?: IUploadOptions): Promise<IObject> {
        // Helper async generator making sure that each chunk has at least certain number of bytes
        async function* bufferChunks(input: AsyncIterable<Buffer>, minChunkSize: number) {
            let buffer = Buffer.alloc(2 * minChunkSize);
            let bytesRead = 0;
            for await (const chunk of input) {
                chunk.copy(buffer, bytesRead);
                bytesRead += chunk.byteLength;
                if (bytesRead >= minChunkSize) {
                    yield buffer.slice(0, bytesRead);
                    bytesRead = 0;
                }
            }
            if (bytesRead > 0) {
                yield buffer.slice(0, bytesRead);
            }
        }

        const MaxBatches = 25;
        const ChunkSize = 5 << 20;
        let partsUploaded = 0;
        let bytesUploaded = 0;
        let uploadUrls: string[] = [];
        let uploadKey: string | undefined;
        for await (const chunk of bufferChunks(input, ChunkSize)) {
            while (true) {
                if (uploadUrls.length === 0) {
                    const uploadParams = await this.getUploadUrls(bucketKey, objectKey, MaxBatches, partsUploaded + 1, uploadKey);
                    uploadUrls = uploadParams.urls.slice();
                    uploadKey = uploadParams.uploadKey;
                }
                const url = uploadUrls.shift() as string;
                try {
                    await this.axios.put(url, chunk);
                    break;
                } catch (err) {
                    const status = (err as AxiosError).response?.status as number;
                    if (status === 403) {
                        uploadUrls = []; // Couldn't this cause an infinite loop? (i.e., could the server keep responding with 403 indefinitely?
                    } else {
                        throw err;
                    }
                }
            }
            partsUploaded++;
            bytesUploaded += chunk.byteLength;
            if (options?.progress) {
                options.progress(bytesUploaded, undefined);
            }
        }
        return this.completeUpload(bucketKey, objectKey, uploadKey as string, options?.contentType);
    }

    /**
     * Generates a signed URL that can be used to download a file from OSS.
     * @param bucketKey Bucket key.
     * @param objectKey Object key.
     * @returns {IDownloadParams} Download URLs and potentially other helpful information.
     */
    async getDownloadUrl(bucketKey: string, objectKey: string, useCdn: boolean = true): Promise<IDownloadParams> {
        const endpoint = `buckets/${bucketKey}/objects/${encodeURIComponent(objectKey)}/signeds3download?useCdn=${useCdn}`;
        return this.get(endpoint, { 'Content-Type': 'application/json' }, ReadTokenScopes);
    }

    /**
     * Downloads a specific OSS object.
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Object key.
     * @param {IDownloadOptions} [options] Additional download options.
     * @returns {Promise<ArrayBuffer>} Object content.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async downloadObject(bucketKey: string, objectKey: string, options?: IDownloadOptions): Promise<ArrayBuffer> {
        const downloadParams = await this.getDownloadUrl(bucketKey, objectKey);
        if (downloadParams.status !== 'complete') {
            throw new Error('File not available for download yet.');
        }
        const resp = await this.axios.get(downloadParams.url as string, {
            responseType: 'arraybuffer',
            onDownloadProgress: progressEvent => {
                const downloadedBytes = progressEvent.event.response.length;
                const totalBytes = parseInt(progressEvent.event.responseHeaders['Content-Length']);
                if (options?.progress) {
                    options.progress(downloadedBytes, totalBytes);
                }
            }
        });
        return resp.data;
    }

    /**
     * Downloads content stream of a specific bucket object.
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Object name.
     * @param {IDownloadOptions} [options] Additional download options.
     * @returns {Promise<ReadableStream>} Object content stream.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async downloadObjectStream(bucketKey: string, objectKey: string, options?: IDownloadOptions): Promise<ReadableStream> {
        const downloadParams = await this.getDownloadUrl(bucketKey, objectKey);
        if (downloadParams.status !== 'complete') {
            throw new Error('File not available for download yet.');
        }
        const resp = await this.axios.get(downloadParams.url as string, {
            responseType: 'stream',
            onDownloadProgress: progressEvent => {
                const downloadedBytes = progressEvent.event.response.length;
                const totalBytes = parseInt(progressEvent.event.responseHeaders['Content-Length']);
                if (options?.progress) {
                    options.progress(downloadedBytes, totalBytes);
                }
            }
        });
        return resp.data;
    }

    /**
     * @deprecated This method of resumable upload is now deprecated and will be removed in future versions.
     * Use {@see getUploadUrls} and {@see completeUpload} instead.
     *
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
        console.warn('This method is deprecated and will be removed in future versions.');
        const headers = {
            'Authorization': '',
            'Content-Type': contentType,
            'Content-Length': data.byteLength.toString(),
            'Content-Range': `bytes ${byteOffset}-${byteOffset + data.byteLength - 1}/${totalBytes}`,
            'Session-Id': sessionId
        }
        return this.put(`buckets/${bucketKey}/objects/${encodeURIComponent(objectName)}/resumable`, data, headers, WriteTokenScopes);
    }

    /**
     * @deprecated This method of resumable upload is now deprecated and will be removed in future versions.
     * Use {@see getUploadUrls} and {@see completeUpload} instead.
     *
     * Uploads content stream to a specific bucket object using the resumable capabilities
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-resumable-PUT|docs}).
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectName Name of uploaded object.
     * @param {ReadableStream} stream Object content stream.
     * @param {number} chunkBytes Byte size of the stream to be uploaded.
     * @param {number} byteOffset Byte offset of the uploaded blob in the target object.
     * @param {number} totalBytes Total byte size of the target object.
     * @param {string} sessionId Resumable session ID.
     * @param {string} [contentType='application/stream'] Type of content to be used in HTTP headers, for example, "application/json".
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async uploadObjectStreamResumable(bucketKey: string, objectName: string, stream: ReadableStream, chunkBytes: number, byteOffset: number, totalBytes: number, sessionId: string, contentType: string = 'application/stream') {
        console.warn('This method is deprecated and will be removed in future versions.');
        const headers = {
            'Authorization': '',
            'Content-Type': contentType,
            'Content-Length': chunkBytes.toString(),
            'Content-Range': `bytes ${byteOffset}-${byteOffset + chunkBytes - 1}/${totalBytes}`,
            'Session-Id': sessionId
        }
        return this.put(`buckets/${bucketKey}/objects/${encodeURIComponent(objectName)}/resumable`, stream, headers, WriteTokenScopes);
    }

    /**
     * @deprecated This method of resumable upload is now deprecated and will be removed in future versions.
     * Use {@see getUploadUrls} and {@see completeUpload} instead.
     *
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
        console.warn('This method is deprecated and will be removed in future versions.');
        const config: AxiosRequestConfig = {
            method: 'GET',
            url: `buckets/${bucketKey}/objects/${encodeURIComponent(objectName)}/status/${sessionId}`,
            headers: { 'Authorization': '' }
        };
        await this.setAuthorization(config, ReadTokenScopes);
        const response = await this.fetch(config);
        const ranges = response.headers['range'] || '';
        const match = ranges.match(/^bytes=(\d+-\d+(,\d+-\d+)*)$/);
        if (match) {
            return match[1].split(',').map((str: string) => {
                const tokens = str.split('-');
                return {
                    start: parseInt(tokens[0]),
                    end: parseInt(tokens[1])
                };
            });
        } else {
            throw new Error('Unexpected range format: ' + ranges);
        }
    }

    /**
     * Makes a copy of object under another name within the same bucket
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-copyto-:newObjectName-PUT|docs}).
     * @async
     * @param {string} bucket Bucket key.
     * @param {string} oldObjectKey Original object key.
     * @param {string} newObjectKey New object key.
     * @returns {Promise<IObject>} Details of the new object copy.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async copyObject(bucket: string, oldObjectKey: string, newObjectKey: string): Promise<IObject> {
        return this.put(`buckets/${bucket}/objects/${encodeURIComponent(oldObjectKey)}/copyto/${encodeURIComponent(newObjectKey)}`, null, {}, WriteTokenScopes);
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
        return this.get(`buckets/${bucket}/objects/${encodeURIComponent(object)}/details`, {}, ReadTokenScopes);
    }

    /**
     * Creates signed URL for specific object
     * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-signed-POST|docs}).
     * @async
     * @param {string} bucketId Bucket key.
     * @param {string} objectId Object key.
     * @param {string} [access="readwrite"] Signed URL access authorization.
     * @param {boolean} [useCdn=true] If true, this will generate a CloudFront URL for the S3 object.
     * @returns {Promise<ISignedUrl>} Description of the new signed URL resource.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async createSignedUrl(bucketId: string, objectId: string, access = 'readwrite', useCdn = true): Promise<ISignedUrl> {
        return this.post(`buckets/${bucketId}/objects/${encodeURIComponent(objectId)}/signed?access=${access}&useCdn=${useCdn}`, {}, {}, WriteTokenScopes);
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
        return this.delete(`buckets/${bucketKey}/objects/${encodeURIComponent(objectName)}`, {}, WriteTokenScopes);
    }

    /**
     * Deletes bucket (this endpoint is not documented on the Forge portal).
     * @async
     * @param {string} bucketKey Bucket key.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async deleteBucket(bucketKey: string) {
        return this.delete(`buckets/${bucketKey}`, {}, WriteTokenScopes);
    }
}
