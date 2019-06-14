declare module 'forge-nodejs-utils' {
    interface ITwoLeggedToken {
        access_token: string;
        expires_in: number;
    }

    interface IThreeLeggedToken {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }

    /**
     * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/oauth/v2|authentication APIs}.
     */
    class AuthenticationClient {
        /**
         * Initializes new client with specific Forge app credentials.
         * @param {string} client_id Forge application client ID. 
         * @param {string} client_secret Forge application client secret.
         * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
         */
        constructor(client_id: string, client_secret: string, host?: string);

        /**
         * Retrieves 2-legged access token for a specific set of scopes
         * ({@link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authenticate-POST|docs}).
         * Unless the {@see force} parameter is used, the access tokens are cached
         * based on their scopes and the 'expires_in' field in the response.
         * @async
         * @param {string[]} scopes List of requested {@link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes|scopes}.
         * @param {boolean} [force] Skip cache, if there is any, and retrieve a new token.
         * @returns {Promise<ITwoLeggedToken>} Promise of 2-legged authentication object containing two fields,
         * 'access_token' with the actual token, and 'expires_in' with expiration time (in seconds).
         */
        authenticate(scopes: string[], force?: boolean): Promise<ITwoLeggedToken>;

        /**
         * Generates a URL for 3-legged authentication.
         * @param {string[]} scopes List of requested {@link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes|scopes}.
         * @param {string} redirectUri Same redirect URI as defined by the Forge app.
         * @returns {string} Autodesk login URL.
         */
        getAuthorizeRedirect(scopes: string[], redirectUri: string): string;

        /**
         * Exchanges 3-legged authentication code for an access token
         * ({@link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/gettoken-POST|docs}).
         * @async
         * @param {string} code Authentication code returned from the Autodesk login process.
         * @param {string} redirectUri Same redirect URI as defined by the Forge app.
         * @returns {Promise<IThreeLeggedToken>} Promise of 3-legged authentication object containing
         * 'access_token', 'refresh_token', and 'expires_in' with expiration time (in seconds).
         */
        getToken(code: string, redirectUri: string): Promise<IThreeLeggedToken>;
    }

    interface IAuthOptions {
        client_id: string;
        client_secret: string;
    }

    interface IBucket {
        bucketKey: string;
        createdDate: number;
        policyKey: string;
    }

    interface IBucketPermission {
        authId: string;
        access: string;
    }

    interface IBucketDetail extends IBucket {
        bucketOwner: string;
        permissions: IBucketPermission[];
    }

    interface IObject {
        objectKey: string;
        bucketKey: string;
        objectId: string;
        sha1: string;
        size: number;
        location: string;
    }

    interface IResumableUploadRange {
        start: number;
        end: number;
    }

    interface ISignedUrl {
        signedUrl: string;
        expiration: number;
        singleUse: boolean;
    }

    /**
     * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/data/v2|data management APIs}.
     */
    class DataManagementClient {
        /**
         * Initializes new client with specific authentication method.
         * @param {IAuthOptions} [auth] Authentication object,
         * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
         * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
         * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
         */
        constructor(auth?: IAuthOptions, host?: string);

        /**
         * Iterates over all buckets in pages of predefined size
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET|docs}).
         * @async
         * @generator
         * @param {number} [limit=16] Max number of buckets to receive in one batch (allowed values: 1-100).
         * @yields {Promise<IBucket[]>} List of bucket object containing 'bucketKey', 'createdDate', and 'policyKey'.
         * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
         */
        iterateBuckets(limit?: number): AsyncIterable<IBucket>;

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
         * @param {string} bucketKey Bucket key.
         * @returns {Promise<IBucketDetail>} Bucket details, with properties "bucketKey", "bucketOwner", "createdDate",
         * "permissions", and "policyKey".
         * @throws Error when the request fails, for example, due to insufficient rights, or when a bucket
         * with this name does not exist.
         */
        getBucketDetails(bucketKey: string): Promise<IBucketDetail>;

        /**
         * Creates a new bucket
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-POST|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} dataRetention One of the following: transient, temporary, permanent.
         * @returns {Promise<IBucketDetail>} Bucket details, with properties "bucketKey", "bucketOwner", "createdDate",
         * "permissions", and "policyKey".
         * @throws Error when the request fails, for example, due to insufficient rights, incorrect scopes,
         * or when a bucket with this name already exists.
         */
        createBucket(bucketKey: string, dataRetention: string): Promise<IBucketDetail>;

        /**
         * Iterates over all objects in a bucket in pages of predefined size
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
         * @async
         * @generator
         * @param {string} bucketKey Bucket key.
         * @param {number} [limit=16] Max number of objects to receive in one batch (allowed values: 1-100).
         * @param {string} [beginsWith] Optional filter to only return objects whose keys are prefixed with this value.
         * @yields {Promise<IObject[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
         * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
         */
        iterateObjects(bucketKey: string, limit?: number, beginsWith?: string): AsyncIterable<IObject>;

        /**
         * Lists all objects in a bucket
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} [beginsWith] Optional filter to only return objects whose keys are prefixed with this value.
         * @returns {Promise<IObject[]>} List of object containing 'bucketKey', 'objectKey', 'objectId', 'sha1', 'size', and 'location'.
         * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
         */
        listObjects(bucketKey: string, beginsWith?: string): Promise<IObject[]>;

        /**
         * Uploads content to a specific bucket object
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-PUT|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} objectKey Name of uploaded object.
         * @param {string} contentType Type of content to be used in HTTP headers, for example, "application/json".
         * @param {Buffer} data Object content.
         * @returns {Promise<IObject>} Object description containing 'bucketKey', 'objectKey', 'objectId',
         * 'sha1', 'size', 'location', and 'contentType'.
         * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
         */
        uploadObject(bucketKey: string, objectKey: string, contentType: string, data: Buffer): Promise<IObject>;

        /**
         * Uploads content to a specific bucket object using the resumable capabilities
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-resumable-PUT|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} objectKey Name of uploaded object.
         * @param {Buffer} data Object content.
         * @param {number} byteOffset Byte offset of the uploaded blob in the target object.
         * @param {number} totalBytes Total byte size of the target object.
         * @param {string} sessionId Resumable session ID.
         * @param {string} [contentType='application/stream'] Type of content to be used in HTTP headers, for example, "application/json".
         * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
         */
        uploadObjectResumable(bucketKey: string, objectKey: string, data: Buffer, byteOffset: number, totalBytes: number, sessionId: string, contentType?: string): void;

        /**
         * Gets status of a resumable upload session
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-status-:sessionId-GET|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} objectKey Name of uploaded object.
         * @param {string} sessionId Resumable session ID.
         * @returns {Promise<IResumableUploadRange[]>} List of range objects, with each object specifying 'start' and 'end' byte offsets
         * of data that has already been uploaded.
         * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
         */
        getResumableUploadStatus(bucketKey: string, objectKey: string, sessionId: string): Promise<IResumableUploadRange[]>;

        /**
         * Downloads content of a specific bucket object
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-GET|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} objectKey Object name.
         * @returns {Promise<ArrayBuffer>} Object content.
         * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
         */
        downloadObject(bucketKey: string, objectKey: string): Promise<ArrayBuffer>;

        /**
         * Gets details of a specific bucket object
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-details-GET|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} objectKey Object name.
         * @returns {Promise<IObject>} Object description containing 'bucketKey', 'objectKey', 'objectId',
         * 'sha1', 'size', 'location', and 'contentType'.
         * @throws Error when the request fails, for example, due to insufficient rights, or when an object
         * with this name does not exist.
         */
        getObjectDetails(bucketKey: string, objectKey: string): Promise<IObject>;

        /**
         * Creates signed URL for specific object
         * ({@link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-signed-POST|docs}).
         * @async
         * @param {string} bucketKey Bucket key.
         * @param {string} objectKey Object key.
         * @param {string} [access="readwrite"] Signed URL access authorization.
         * @returns {Promise<ISignedUrl>} Description of the new signed URL resource.
         * @throws Error when the request fails, for example, due to insufficient rights.
         */
        createSignedUrl(bucketKey: string, objectKey: string, access?: string): Promise<ISignedUrl>;
    }

    interface IDerivativeOutputType {
        type: 'svf',
        views: string[];
    }

    interface IJob {
        result: string;
        urn: string;
        //acceptedJobs?: any;
        //output?: any;
    }

    interface IDerivativeManifest {
        type: string;
        hasThumbnail: string;
        status: string;
        progress: string;
        region: string;
        urn: string;
        version: string;
        //derivatives: any[];
    }

    interface IDerivativeMetadata {
        // TODO
    }

    interface IDerivativeTree {
        // TODO
    }

    interface IDerivativeProps {
        // TODO
    }

    /**
     * Client providing access to Autodesk Forge
     * {@link https://forge.autodesk.com/en/docs/model-derivative/v2|model derivative APIs}.
     */
    class ModelDerivativeClient {
        /**
         * Initializes new client with specific authentication method.
         * @param {IAuthOptions} [auth={client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET}] Authentication object,
         * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
         * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
         * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
         */
        constructor(auth?: IAuthOptions, host?: string);

        /**
         * Gets a list of supported translation formats.
         * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/formats-GET|docs}).
         * @async
         * @yields {Promise<{ [outputFormat: string]: string[] }>} Dictionary of all supported output formats
         * mapped to arrays of formats these outputs can be obtained from.
         * @throws Error when the request fails, for example, due to insufficient rights.
         */
        formats(): Promise<{ [outputFormat: string]: string[] }>;

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
        submitJob(urn: string, outputs: IDerivativeOutputType[]): Promise<IJob>;

        /**
         * Retrieves manifest of a derivative.
         * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-GET|docs}).
         * @async
         * @param {string} urn Document derivative URN.
         * @returns {Promise<IDerivativeManifest>} Document derivative manifest.
         * @throws Error when the request fails, for example, due to insufficient rights.
         */
        getManifest(urn: string): Promise<IDerivativeManifest>;

        /**
         * Retrieves metadata of a derivative.
         * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-GET|docs}).
         * @async
         * @param {string} urn Document derivative URN.
         * @returns {Promise<IDerivativeMetadata>} Document derivative metadata.
         * @throws Error when the request fails, for example, due to insufficient rights.
         */
        getMetadata(urn: string): Promise<IDerivativeMetadata>;

        /**
         * Retrieves object tree of a specific viewable.
         * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET|docs}).
         * @async
         * @param {string} urn Document derivative URN.
         * @param {string} guid Viewable GUID.
         * @returns {Promise<IDerivativeTree>} Viewable object tree.
         * @throws Error when the request fails, for example, due to insufficient rights.
         */
        getViewableTree(urn: string, guid: string): Promise<IDerivativeTree>;

        /**
         * Retrieves properties of a specific viewable.
         * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET|docs}).
         * @async
         * @param {string} urn Document derivative URN.
         * @param {string} guid Viewable GUID.
         * @returns {Promise<IDerivativeProps>} Viewable properties.
         * @throws Error when the request fails, for example, due to insufficient rights.
         */
        getViewableProperties(urn: string, guid: string): Promise<IDerivativeProps>;
    }
}