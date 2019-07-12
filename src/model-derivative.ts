import { ForgeClient, IAuthOptions, Region } from './common';

const RootPath = '/modelderivative/v2';
const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:read', 'data:write', 'data:create'];

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
     * Gets a list of supported translation formats.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/formats-GET|docs}).
     * @async
     * @yields {Promise<IDerivativeFormats>} Dictionary of all supported output formats
     * mapped to arrays of formats these outputs can be obtained from.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async formats(): Promise<IDerivativeFormats> {
        const response = await this.get('/designdata/formats', {}, ReadTokenScopes);
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
     * @returns {Promise<IJob>} Translation job details, with properties 'result',
     * 'urn', and 'acceptedJobs'.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async submitJob(urn: string, outputs: IDerivativeOutputType[], pathInArchive?: string): Promise<IJob> {
        const params: any = {
            input: {
                urn: urn
            },
            output: {
                formats: outputs
            }
        };
        if (pathInArchive) {
            params.input.compressedUrn = true;
            params.input.rootFilename = pathInArchive;
        }
        return this.post('/designdata/job', { json: params }, {}, WriteTokenScopes);
    }

    /**
     * Retrieves manifest of a derivative.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeManifest>} Document derivative manifest.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getManifest(urn: string): Promise<IDerivativeManifest> {
        return this.get(this.region === Region.EMEA ? `/regions/eu/designdata/${urn}/manifest` : `/designdata/${urn}/manifest`, {}, ReadTokenScopes, true);
    }

    /**
     * Retrieves metadata of a derivative.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeMetadata>} Document derivative metadata.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getMetadata(urn: string): Promise<IDerivativeMetadata> {
        return this.get(this.region === Region.EMEA ? `/regions/eu/designdata/${urn}/metadata` : `/designdata/${urn}/metadata`, {}, ReadTokenScopes, true);
    }

    /**
     * Retrieves object tree of a specific viewable.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @returns {Promise<IDerivativeTree>} Viewable object tree.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableTree(urn: string, guid: string): Promise<IDerivativeTree> {
        return this.get(this.region === Region.EMEA ? `/regions/eu/designdata/${urn}/metadata/${guid}` : `/designdata/${urn}/metadata/${guid}`, {}, ReadTokenScopes, true);
    }

    /**
     * Retrieves properties of a specific viewable.
     * ({@link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET|docs}).
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @returns {Promise<IDerivativeProps>} Viewable properties.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    async getViewableProperties(urn: string, guid: string): Promise<IDerivativeProps> {
        return this.get(this.region === Region.EMEA ? `/regions/eu/designdata/${urn}/metadata/${guid}/properties` : `/designdata/${urn}/metadata/${guid}/properties`, {}, ReadTokenScopes, true);
    }
}
