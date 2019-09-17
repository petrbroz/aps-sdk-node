import { ForgeClient, IAuthOptions, Region } from './common';

const RootPath = 'modelderivative/v2';
const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:read', 'data:write', 'data:create'];

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

export interface IDerivativeOutputType {
    type: 'svf',
    views: string[];
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
    //derivatives: any[];
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
     * @param {IDerivativeOutputType[]} outputs List of requested output formats. Currently the one
     * supported format is `{ type: 'svf', views: ['2d', '3d'] }`.
     * @param {string} [pathInArchive] Optional relative path to root design if the translated file is an archive.
     * @param {boolean} [force] Force translation even if a derivative already exists.
     * @returns {Promise<IJob>} Translation job details, with properties 'result',
     * 'urn', and 'acceptedJobs'.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async submitJob(urn: string, outputs: IDerivativeOutputType[], pathInArchive?: string, force?: boolean): Promise<IJob> {
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
        return this.get(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/manifest` : `designdata/${urn}/manifest`, {}, ReadTokenScopes, true);
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
        return this.getBuffer(this.region === Region.EMEA ? `regions/eu/designdata/${modelUrn}/manifest/${derivativeUrn}` : `designdata/${modelUrn}/manifest/${derivativeUrn}`, {}, ReadTokenScopes);
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
        return this.getStream(this.region === Region.EMEA ? `regions/eu/designdata/${modelUrn}/manifest/${derivativeUrn}` : `designdata/${modelUrn}/manifest/${derivativeUrn}`, {}, ReadTokenScopes);
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
        return this.get(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata` : `designdata/${urn}/metadata`, {}, ReadTokenScopes, true);
    }

    /**
     * Retrieves object tree of a specific viewable
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {boolean} [force] Force query even when exceeding the size limit (20MB).
     * @returns {Promise<IDerivativeTree>} Viewable object tree.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableTree(urn: string, guid: string, force?: boolean): Promise<IDerivativeTree> {
        return this.get(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata/${guid}${force ? '?forceget=true' : ''}` : `designdata/${urn}/metadata/${guid}${force ? '?forceget=true' : ''}`, {}, ReadTokenScopes, true);
    }

    /**
     * Retrieves properties of a specific viewable
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {boolean} [force] Force query even when exceeding the size limit (20MB).
     * @returns {Promise<IDerivativeProps>} Viewable properties.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableProperties(urn: string, guid: string, force?: boolean): Promise<IDerivativeProps> {
        return this.get(this.region === Region.EMEA ? `regions/eu/designdata/${urn}/metadata/${guid}/properties${force ? '?forceget=true' : ''}` : `designdata/${urn}/metadata/${guid}/properties${force ? '?forceget=true' : ''}`, {}, ReadTokenScopes, true);
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
