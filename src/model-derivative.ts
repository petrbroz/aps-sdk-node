import { Readable } from 'stream';

import { ForgeClient, IAuthOptions, Region, sleep } from './common';

const isNullOrUndefined = (value: any) => value === null || value === undefined;

const RootPath = 'modelderivative/v2';
const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:read', 'data:write', 'data:create'];
const RetryDelay = 5000;

/**
 * Converts ID of an object to base64-encoded URN expected by {@link ModelDerivativeClient}.
 * @param {string} id Object ID.
 * @returns {string} base64-encoded object URN.
 * @example
 * urnify('urn:adsk.objects:os.object:my-bucket/my-file.dwg');
 * // Returns 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bXktYnVja2V0L215LWZpbGUuZHdn'
 */
export function urnify(id: string): string {
    return Buffer.from(id).toString('base64').replace(/=/g, '');
}

export interface IDerivativeFormats {
    [outputFormat: string]: string[];
}

export type IDerivativeOutputType = IDerivativeOutputTypeSVF
    | IDerivativeOutputTypeSVF2
    | IDerivativeOutputTypeSTL
    | IDerivativeOutputTypeSTEP
    | IDerivativeOutputTypeIGES
    | IDerivativeOutputTypeOBJ
    | IDerivativeOutputTypeDWG
    | IDerivativeOutputTypeIFC;

export interface IDerivativeOutputTypeSVF {
    type: 'svf',
    views: string[];
    advanced?: {
        switchLoader?: boolean;
        conversionMethod?: string;
        buildingStoreys?: string;
        spaces?: string;
        openingElements?: string;
        generateMasterViews?: boolean;
        materialMode?: string;
        hiddenObjects?: boolean;
        basicMaterialProperties?: boolean;
        autodeskMaterialProperties?: boolean;
        timelinerProperties?: boolean;
    };
}

export interface IDerivativeOutputTypeSVF2 {
    type: 'svf2',
    views: string[];
    advanced?: {
        switchLoader?: boolean;
        conversionMethod?: string;
        buildingStoreys?: string;
        spaces?: string;
        openingElements?: string;
        generateMasterViews?: boolean;
        materialMode?: string;
        hiddenObjects?: boolean;
        basicMaterialProperties?: boolean;
        autodeskMaterialProperties?: boolean;
        timelinerProperties?: boolean;
    };
}

export interface IDerivativeOutputTypeSTL {
    type: 'stl',
    advanced?: {
        format?: string;
        exportColor?: boolean;
        exportFileStructure?: string;
    };
}

export interface IDerivativeOutputTypeSTEP {
    type: 'step',
    advanced?: {
        applicationProtocol?: string;
        tolerance?: number;
    };
}

export interface IDerivativeOutputTypeIGES {
    type: 'iges',
    advanced?: {
        tolerance?: number;
        surfaceType?: string;
        sheetType?: string;
        solidType?: string;
    };
}

export interface IDerivativeOutputTypeOBJ {
    type: 'obj',
    advanced?: {
        exportFileStructure?: string;
        unit?: string;
        modelGuid?: string;
        objectIds?: number[];
    };
}

export interface IDerivativeOutputTypeDWG {
    type: 'dwg',
    advanced?: {
        exportSettingName?: string;
    };
}

export interface IDerivativeOutputTypeIFC {
    type: 'ifc',
    advanced?: {
        exportSettingName?: string;
    };
}

export interface IJob {
    result: string;
    urn: string;
    //acceptedJobs?: any;
    //output?: any;
}

export interface IDerivativeManifest {
    type: string;
    hasThumbnail: string;
    status: string;
    progress: string;
    region: string;
    urn: string;
    version: string;
    derivatives: IDerivative[];
}

export interface IDerivative {
    status: string;
    progress?: string;
    name?: string;
    hasThumbnail?: string;
    outputType?: string;
    children?: DerivativeChild[];
}

type DerivativeChild = IDerivativeResourceChild | IDerivativeGeometryChild | IDerivativeViewChild;

export interface IDerivativeChild {
    guid: string;
    type: string;
    role: string;
    status: string;
    progress?: string;
    children?: DerivativeChild[];
}

export interface IDerivativeResourceChild extends IDerivativeChild {
    type: 'resource';
    urn: string;
    mime: string;
}

export interface IDerivativeGeometryChild extends IDerivativeChild {
    type: 'geometry';
    name?: string;
    viewableID?: string;
    phaseNames?: string;
    hasThumbnail?: string;
    properties?: any;
}

export interface IDerivativeViewChild extends IDerivativeChild {
    type: 'view';
    name?: string;
    camera?: number[];
    viewbox?: number[];
}

export interface IDerivativeMetadata {
    // TODO
}

export interface IDerivativeTree {
    // TODO
}

export interface IDerivativeProps {
    // TODO
}

export enum ThumbnailSize {
    Small = 100,
    Medium = 200,
    Large = 400
}

interface IDerivativeDownloadInfo {
    etag: string;
    size: number;
    url: string;
    'content-type': string;
    expiration: number;
    cookies: { [key: string]: string };
}

/**
 * Utility class for querying {@see IDerivativeManifest}.
 */
export class ManifestHelper {
    constructor(protected manifest: IDerivativeManifest) {}

    /**
     * Finds manifest derivatives with matching 'guid', 'type', or 'role' properties.
     * @param {object} query Dictionary of the requested properties and values.
     * @returns {DerivativeChild[]} Matching derivatives.
     */
    search(query: { guid?: string; type?: string; role?: string; }): DerivativeChild[] {
        let matches: DerivativeChild[] = [];
        this.traverse((child: DerivativeChild) => {
            if ((isNullOrUndefined(query.guid) || child.guid === query.guid)
                && (isNullOrUndefined(query.type) || child.type === query.type)
                && (isNullOrUndefined(query.role) || child.role === query.role)) {
                matches.push(child);
            }
            return true;
        });
        return matches;
    }

    /**
     * Traverses all derivatives, executing the input callback for each one.
     * @param {(child: DerivativeChild) => boolean} callback Function to be called for each derivative,
     * returning a bool indicating whether the traversal should recurse deeper in the manifest hierarchy.
     */
    traverse(callback: (child: DerivativeChild) => boolean) {
        function process(node: DerivativeChild, callback: (child: DerivativeChild) => boolean) {
            const proceed = callback(node);
            if (proceed && node.children) {
                for (const child of node.children) {
                    process(child, callback);
                }
            }
        }
        for (const derivative of this.manifest.derivatives) {
            if (derivative.children) {
                for (const child of derivative.children) {
                    process(child, callback);
                }
            }
        }
    }
}

/**
 * Client providing access to Autodesk Forge
 * {@link https://forge.autodesk.com/en/docs/model-derivative/v2|model derivative APIs}.
 * @tutorial model-derivative
 */
export class ModelDerivativeClient extends ForgeClient {
    /**
     * Initializes new client with specific authentication method.
     * @param {IAuthOptions} auth Authentication object,
     * containing either `client_id` and `client_secret` properties (for 2-legged authentication),
     * or a single `token` property (for 2-legged or 3-legged authentication with pre-generated access token).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     * @param {Region} [region="US"] Forge availability region.
     */
    constructor(auth: IAuthOptions, host?: string, region?: Region) {
        super(RootPath, auth, host, region);
    }

    private getUrl(path: string): URL {
        return new URL(this.host + '/' + RootPath + '/' + path);
    }

    /**
     * Gets a list of supported translation formats
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/formats-GET|docs}).
     * @async
     * @yields {Promise<IDerivativeFormats>} Dictionary of all supported output formats
     * mapped to arrays of formats these outputs can be obtained from.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async formats(): Promise<IDerivativeFormats> {
        const response = await this.get('designdata/formats', {}, ReadTokenScopes);
        return response.formats;
    }

    /**
     * Submits a translation job
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/job-POST|docs}).
     * @async
     * @param {string} urn Document to be translated.
     * @param {IDerivativeOutputType[]} outputs List of requested output formats.
     * @param {string} [pathInArchive] Optional relative path to root design if the translated file is an archive.
     * @param {boolean} [force] Force translation even if a derivative already exists.
     * @param {string} [workflowId] Optional workflow ID to be used with Forge Webhooks.
     * @param {object} [workflowAttr] Optional workflow attributes to be used with Forge Webhooks.
     * @returns {Promise<IJob>} Translation job details, with properties 'result',
     * 'urn', and 'acceptedJobs'.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async submitJob(urn: string, outputs: IDerivativeOutputType[], pathInArchive?: string, force?: boolean, workflowId?: string, workflowAttr?: object): Promise<IJob> {
        const params: any = {
            input: {
                urn: urn
            },
            output: {
                formats: outputs,
                destination: {
                    region: this.region
                }
            }
        };
        if (pathInArchive) {
            params.input.compressedUrn = true;
            params.input.rootFilename = pathInArchive;
        }
        if (workflowId) {
            params.misc = {
                workflow: workflowId
            };
            if (workflowAttr) {
                params.misc.workflowAttribute = workflowAttr;
            }
        }
        const headers: { [key: string]: string } = {};
        if (force) {
            headers['x-ads-force'] = 'true';
        }
        return this.post('designdata/job', params, headers, WriteTokenScopes);
    }

    /**
     * Retrieves manifest of a derivative
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeManifest>} Document derivative manifest.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getManifest(urn: string): Promise<IDerivativeManifest> {
        return this.get(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/manifest` : `designdata/${urn}/manifest`, {}, ReadTokenScopes);
    }

    /**
     * Deletes manifest
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-DELETE|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async deleteManifest(urn: string) {
        return this.delete(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/manifest` : `designdata/${urn}/manifest`, {}, WriteTokenScopes);
    }

    // Generates URL for downloading specific derivative
    // https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeUrn-signedcookies-GET
    protected async getDerivativeDownloadUrl(modelUrn: string, derivativeUrn: string): Promise<IDerivativeDownloadInfo> {
        const endpoint = this.region === Region.EMEA
            ? `regions/eu/designdata/${modelUrn}/manifest/${derivativeUrn}/signedcookies`
            : `designdata/${modelUrn}/manifest/${derivativeUrn}/signedcookies`;
        const config = {};
        await this.setAuthorization(config, ReadTokenScopes);
        const resp = await this.axios.get(endpoint, config);
        const record: IDerivativeDownloadInfo = {
            etag: resp.data.etag,
            size: resp.data.size,
            url: resp.data.url,
            'content-type': resp.data['content-type'],
            expiration: resp.data.expiration,
            cookies: {}
        };
        if(!resp || !resp.headers || !resp.headers['set-cookie']){
            return record
        }
        for (const cookie of resp.headers['set-cookie']) {
            const tokens = cookie.split(';');
            const [key, val] = tokens[0].trim().split('=');
            record.cookies[key] = val;
        }
        return record;
    }

    /**
     * Downloads content of a specific model derivative
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeurn-GET/|docs}).
     * @async
     * @param {string} modelUrn Model URN.
     * @param {string} derivativeUrn Derivative URN.
     * @returns {Promise<ArrayBuffer>} Derivative content.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getDerivative(modelUrn: string, derivativeUrn: string): Promise<ArrayBuffer> {
        const downloadInfo = await this.getDerivativeDownloadUrl(modelUrn, derivativeUrn);
        const resp = await this.axios.get(downloadInfo.url, {
            responseType: 'arraybuffer',
            decompress: false,
            headers: {
                Cookie: Object.keys(downloadInfo.cookies).map(key => `${key}=${downloadInfo.cookies[key]}`).join(';')
            }
        });
        return resp.data;
    }

    /**
     * Downloads content of a specific model derivative
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeurn-GET/|docs}).
     * @async
     * @param {string} modelUrn Model URN.
     * @param {string} derivativeUrn Derivative URN.
     * @returns {Promise<ReadableStream>} Derivative content stream.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getDerivativeStream(modelUrn: string, derivativeUrn: string): Promise<ReadableStream> {
        const downloadInfo = await this.getDerivativeDownloadUrl(modelUrn, derivativeUrn);
        const resp = await this.axios.get(downloadInfo.url, {
            responseType: 'stream',
            decompress: false
        });
        return resp.data;
    }

    /**
     * Downloads content of a specific model derivative asset in chunks
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeurn-GET/|docs}).
     * @param {string} modelUrn Model URN.
     * @param {string} derivativeUrn Derivative URN.
     * @param {number} [maxChunkSize=1<<24] Maximum size (in bytes) of a single downloaded chunk.
     * @returns {Readable} Readable stream with the content of the downloaded derivative asset.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    getDerivativeChunked(modelUrn: string, derivativeUrn: string, maxChunkSize: number = 1 << 24): Readable {
        const client = this;
        async function * read() {
            const downloadInfo = await client.getDerivativeDownloadUrl(modelUrn, derivativeUrn);
            const contentLength = downloadInfo.size;
            let resp = await client.axios.head(downloadInfo.url);
            let streamedBytes = 0;
            while (streamedBytes < contentLength) {
                const chunkSize = Math.min(maxChunkSize, contentLength - streamedBytes);
                resp = await client.axios.get(downloadInfo.url, {
                    responseType: 'arraybuffer',
                    decompress: false,
                    headers: {
                        Range: `bytes=${streamedBytes}-${streamedBytes + chunkSize - 1}`
                    }
                });
                yield resp.data;
                streamedBytes += chunkSize;
            }
        }
        return Readable.from(read());
    }

    /**
     * Retrieves metadata of a derivative
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeMetadata>} Document derivative metadata.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getMetadata(urn: string): Promise<IDerivativeMetadata> {
        return this.get(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata` : `designdata/${urn}/metadata`, {}, ReadTokenScopes);
    }

    /**
     * Retrieves metadata of a derivative as a readable stream
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<ReadableStream>} Document derivative metadata.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getMetadataStream(urn: string): Promise<ReadableStream> {
        return this.getStream(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata` : `designdata/${urn}/metadata`, {}, ReadTokenScopes);
    }

    /**
     * Retrieves object tree of a specific viewable
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {boolean} [force] Force query even when exceeding the size limit (20MB).
     * @param {number} [objectId] If specified, retrieves the sub-tree that has the specified object ID as its parent node.
     * If this parameter is not specified, retrieves the entire object tree.
     * @param {boolean} [retryOn202] Keep repeating the request while the response status is 202 (indicating that the resource is being prepared).
     * @param {boolean} [includeLevel1] If true, grabs only the first level from the specified objectId. ObjectId must be provided.
     * @returns {Promise<IDerivativeTree>} Viewable object tree.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableTree(urn: string, guid: string, force?: boolean, objectId?: number, retryOn202: boolean = true, includeLevel1?: boolean): Promise<IDerivativeTree> {
        const url = this.getUrl(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata/${guid}` : `designdata/${urn}/metadata/${guid}`);
        if (force)
            url.searchParams.append('forceget', 'true');
        if (objectId)
            url.searchParams.append('objectid', objectId.toString());
        if(includeLevel1 && objectId)
            url.searchParams.append('level', "1");
        const config = {};
        await this.setAuthorization(config, ReadTokenScopes);
        let resp = await this.axios.get(url.toString(), config);
        while (resp.status === 202 && retryOn202) {
            await sleep(RetryDelay);
            await this.setAuthorization(config, ReadTokenScopes);
            resp = await this.axios.get(url.toString(), config);
        }
        return resp.data;
    }

    /**
     * Retrieves object tree of a specific viewable as a readable stream
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {boolean} [force] Force query even when exceeding the size limit (20MB).
     * @param {number} [objectId] If specified, retrieves the sub-tree that has the specified object ID as its parent node.
     * If this parameter is not specified, retrieves the entire object tree.
     * @param {boolean} [retryOn202] Keep repeating the request while the response status is 202 (indicating that the resource is being prepared).
     * @returns {Promise<ReadableStream>} Readable stream.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableTreeStream(urn: string, guid: string, force?: boolean, objectId?: number, retryOn202: boolean = true): Promise<ReadableStream> {
        const url = this.getUrl(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata/${guid}` : `designdata/${urn}/metadata/${guid}`);
        if (force)
            url.searchParams.append('forceget', 'true');
        if (objectId)
            url.searchParams.append('objectid', objectId.toString());
        const config: any = { responseType: 'stream' };
        await this.setAuthorization(config, ReadTokenScopes);
        let resp = await this.axios.get(url.toString(), config);
        while (resp.status === 202 && retryOn202) {
            await sleep(RetryDelay);
            await this.setAuthorization(config, ReadTokenScopes);
            resp = await this.axios.get(url.toString(), config);
        }
        return resp.data;
    }

    /**
     * Retrieves properties of a specific viewable
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {boolean} [force] Force query even when exceeding the size limit (20MB).
     * @param {number} [objectId] The Object ID of the object you want to query properties for.
     * If `objectid` is omitted, the server returns properties for all objects.
     * @param {boolean} [retryOn202] Keep repeating the request while the response status is 202 (indicating that the resource is being prepared).
     * @returns {Promise<IDerivativeProps>} Viewable properties.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableProperties(urn: string, guid: string, force?: boolean, objectId?: number, retryOn202: boolean = true): Promise<IDerivativeProps> {
        const url = this.getUrl(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata/${guid}/properties` : `designdata/${urn}/metadata/${guid}/properties`);
        if (force)
            url.searchParams.append('forceget', 'true');
        if (objectId)
            url.searchParams.append('objectid', objectId.toString());
        const config: any = {};
        await this.setAuthorization(config, ReadTokenScopes);
        let resp = await this.axios.get(url.toString(), config);
        while (resp.status === 202 && retryOn202) {
            await sleep(RetryDelay);
            await this.setAuthorization(config, ReadTokenScopes);
            resp = await this.axios.get(url.toString(), config);
        }
        return resp.data;
    }

    /**
     * Retrieves properties of a specific viewable as a readable stream
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {boolean} [force] Force query even when exceeding the size limit (20MB).
     * @param {number} [objectId] The Object ID of the object you want to query properties for.
     * If `objectid` is omitted, the server returns properties for all objects.
     * @param {boolean} [retryOn202] Keep repeating the request while the response status is 202 (indicating that the resource is being prepared).
     * @returns {Promise<ReadableStream>} Readable stream.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewablePropertiesStream(urn: string, guid: string, force?: boolean, objectId?: number, retryOn202: boolean = true): Promise<ReadableStream> {
        const url = this.getUrl(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata/${guid}/properties` : `designdata/${urn}/metadata/${guid}/properties`);
        if (force)
            url.searchParams.append('forceget', 'true');
        if (objectId)
            url.searchParams.append('objectid', objectId.toString());
        const config: any = { responseType: 'stream' };
        await this.setAuthorization(config, ReadTokenScopes);
        let resp = await this.axios.get(url.toString(), config);
        while (resp.status === 202 && retryOn202) {
            await sleep(RetryDelay);
            await this.setAuthorization(config, ReadTokenScopes);
            resp = await this.axios.get(url.toString(), config);
        }
        return resp.data;
    }

    /**
     * Retrieves derivative thumbnail
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-thumbnail-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {ThumbnailSize} [size=ThumbnailSize.Medium] Thumbnail size (small: 100x100 px, medium: 200x200 px, or large: 400x400 px).
     * @returns {Promise<ArrayBuffer>} Thumbnail data.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getThumbnail(urn: string, size: ThumbnailSize = ThumbnailSize.Medium): Promise<ArrayBuffer> {
        const endpoint = this.region === Region.EMEA ? `regions/eu/designdata/${urn}/thumbnail` : `designdata/${urn}/thumbnail`;
        return this.getBuffer(endpoint + '?width=' + size, {}, ReadTokenScopes);
    }

    /**
     * Retrieves derivative thumbnail stream
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-thumbnail-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {ThumbnailSize} [size=ThumbnailSize.Medium] Thumbnail size (small: 100x100 px, medium: 200x200 px, or large: 400x400 px).
     * @returns {Promise<ReadableStream>} Thumbnail data stream.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    async getThumbnailStream(urn: string, size: ThumbnailSize = ThumbnailSize.Medium): Promise<ReadableStream> {
        const endpoint = this.region === Region.EMEA ? `regions/eu/designdata/${urn}/thumbnail` : `designdata/${urn}/thumbnail`;
        return this.getStream(endpoint + '?width=' + size, {}, ReadTokenScopes);
    }
}
