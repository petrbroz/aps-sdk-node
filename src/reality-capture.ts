import qs from 'qs';
import { ForgeClient, IAuthOptions } from './common';

const ReadTokenScopes = ['data:read'];
const WriteTokenScopes = ['data:write'];

/**
 * The reconstruction engine version.
 * Default version is 3.0
 */
export enum EngineVersion {
    VersionOne = '1.0',
    VersionTwo = '2.0',
    VersionThree = '3.0'
}

export enum FileType {
    Image = 'image',
    Survey = 'survey'
}

/**
 * Specifies the GPS coordinates type.
 * Note: This parameter is available only if scenetype is set to aerial.
 */
export enum GpsType {
    Regular = 'regular',
    Precise = 'precise'
}

/**
 * Enumeration for supported photoscene output formats
 * .rcm: Autodesk Recap Photo Mesh (default)
 * .rcs: Autodesk Recap Point Cloud^
 * .obj: Wavefront Object
 * .fbx: Autodesk FBX 3D asset exchange format
 * .ortho: Ortho Photo and Elevation Map^
 * .report: Quality Report^
 * ^ These parameter values are available only if scenetype is set to aerial.
 */
export enum OutputFormat {
    RecapPhotoMesh = 'rcm',
    RecapPointCloud = 'rcs',
    WavefrontObject = 'obj',
    FBXExchangeFormat = 'fbx',
    OrthoPhotoElevationMap = 'ortho',
    QualityReport = 'report'
}

/**
 * Specifies the subject type of the photoscene.
 */
export enum SceneType {
    Aerial = 'aerial',
    Object = 'object'
}

export interface IFile {
    fileid: string;
    filename: string;
    filesize: string;
    msg: string;
}

export interface IFiles {
    photosceneid: string;
    Files: {
        file: IFile[];
    }
}

export interface IPhotoScene {
    Photoscene: {
        photosceneid: string;
    }
}

export interface IPhotoSceneCancelDelete {
    msg: string;
}

export interface IPhotoSceneError {
    code: number;
    msg: string;
}

export interface IPhotoSceneOutput {
    Photoscene: {
        filesize: string;
        photosceneid: string;
        progress: string;
        progressmsg: string;
        resultmsg: string;
        scenelink: string;
        urn: string;
    }
}

export interface IPhotoSceneProcess {
    msg: string;
    Photoscene: {
        photosceneid: string;
    }
}

export interface IPhotoSceneProgress {
    photosceneid: string;
    progressmsg: string;
    progress: string;
}

/**
 * Client providing access to Autodesk Forge {@link https://forge.autodesk.com/en/docs/reality-capture/v1/developers_guide/overview|reality capture APIs}.
 * @tutorial realitycapture
 */
export class RecapClient extends ForgeClient {
    /**
     * Initializes new client with specific authentication method
     * @param {IAuthOptions} auth Authentication object,
     * containing `client_id` and `client_secret` properties (for 2-legged authentication).
     * @param {string} [host="https://developer.api.autodesk.com"] Forge API host.
     */
    constructor(auth: IAuthOptions, host?: string) {
        super('photo-to-3d/v1/', auth, host);
    }

    /**
     * Creates new photoscene
     * {@link https://forge.autodesk.com/en/docs/reality-capture/v1/reference/http/photoscene-POST|docs}.
     * @async
     * @param {string} scenename Specifies the name of the photoscene.
     * @param {string} callback URI to be invoked when the processing of the photoscene has completed.
     * @param {OutputFormat} format Output file format. Multiple file formats can be listed in a comma-delimited list.
     * @param {SceneType} scenetype Specifies the subject type of the photoscene.
     * @param {GpsType} gpstype Specifies the GPS coordinates type.
     * @param {string} hubprojectid The identifier of an A360 Personal hub or BIM 360 Docs project. Output files will be delivered to a folder in this project.
     * @param {string} hubfolderid The URN of an A360 Personal hub or BIM 360 Docs folder. Output files will be delivered to this folder.
     * @param {EngineVersion} version The reconstruction engine version.
     * @param {string[]} metadataname Fine-tuning parameter field names indexed to match the metadata_value index, beginning from index 0.
     * @param {string[]} metadatavalue Fine-tuning parameter values indexed to match the metadata_name index, beginning from index 0.
     * @returns {Promise<IPhotoScene>} A JSON object containing details of the photoscene that was created, with property 'photosceneid' ID of the photoscene that was created.
     * @throws Error when the request fails, for example, due to invalid request.
     */
    async createPhotoScene(scenename: string, callback: string, format: OutputFormat, scenetype: SceneType, gpstype?: GpsType, hubprojectid?: string, hubfolderid?: string, version?: EngineVersion, metadataname?: string[], metadatavalue?: string[]): Promise<IPhotoScene> {
        const params: any = {
            scenename,
            callback,
            format,
            scenetype
        }
        if (scenetype === 'aerial' && gpstype) { 
            params.gpstype = gpstype;
        }
        if (hubprojectid && hubfolderid) {
            params.hubprojectid=hubprojectid;
            params.hubfolderid=hubfolderid;
        }
        if (version) {
            params.version=version;
        }
        if (
            scenetype === 'aerial'
            && metadataname
            && metadatavalue
            && metadataname.length > 0
            && metadatavalue.length > 0
            && metadataname.length === metadatavalue.length
        ) {
            for (let i=0; i<metadataname.length; i++) {
                params[`metadataname[${i}]`]=metadataname[i];
                params[`metadatavalue[${i}]`]=metadatavalue[i];
            }
        }
        const headers: { [key: string]: string } = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return this.post('photoscene', qs.stringify(params), headers, WriteTokenScopes);
    }

    /**
     * Adds one or more files to a photoscene.
     * Only JPEG images are supported.
     * Maximum number of files in a single request: 20
     * Maximum size of a single file: 128 MB
     * Maximum uncompressed size of image in memory: 512 MB
     * Note: Uploaded files will be deleted after 30 days.
     * {@link https://forge.autodesk.com/en/docs/reality-capture/v1/reference/http/file-POST|docs}.
     * @async
     * @param {string} photosceneid Specifies the ID of the photoscene to add the files to.
     * @param {FileType} type Specifies the type of file being uploaded: image (default) or survey
     * @param {string[]} files Specifies the files to be uploaded - these may be URLs (i.e. http://, https://) or local files. For externally stored files, please verify that the URLs are publically accessible.
     * @returns {Promise<IFiles[]|IPhotoSceneError>} A JSON object containing details of the image files uploaded to the photoscene.
     * @throws Error when the request fails, for example, due to invalid request.
     */
    async addImages(photosceneid: string, type: FileType, files: string[]): Promise<IFiles[]|IPhotoSceneError> {
        const params: any = {
            photosceneid,
            type
        };
        for (let i=0; i<files.length; i++) {
            params[`file[${i}]`] = files[i];
        }
        const headers: { [key: string]: string } = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return this.post('file', qs.stringify(params), headers, WriteTokenScopes);
    }

    /**
     * Starts photoscene processing.
     * The main processing steps involve: camera calibration, mesh reconstruction, texturing, and any necessary output file format conversions, in that order.
     * This method should not be called until a photoscene has been created and at least three images have been added to the photoscene.
     * Note: Progress of the processing can be monitored with the GET photoscene/:photosceneid/progress method.
     * {@link https://forge.autodesk.com/en/docs/reality-capture/v1/reference/http/photoscene-:photosceneid-POST|docs}.
     * @async
     * @param {string} photosceneid Specifies the ID of the photoscene to start processing.
     * @returns {Promise<IPhotoSceneProcess|IPhotoSceneError>} A JSON object containing a message for current processing job.
     * @throws Error when the request fails, for example, due to invalid request.
     */
    async processPhotoScene(photosceneid: string): Promise<IPhotoSceneProcess|IPhotoSceneError> {
        const headers: { [key: string]: string } = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return this.post(`photoscene/${photosceneid}`, {}, headers, WriteTokenScopes);
    }

    /**
     * Returns the processing progress and status of a photoscene.
     * @async
     * @param {string} photosceneid Specifies the ID of the photoscene to retrieve status
     * @returns {Promise<IPhotoSceneProgress|IPhotoSceneError>} A JSON object containing details of current progress status.
     * @throws Error when the request fails, for example, due to invalid request.
     */
    async getPhotoSceneProgress(photosceneid: string): Promise<IPhotoSceneProgress|IPhotoSceneError> {
        return this.get(`photoscene/${photosceneid}/progress`, {}, ReadTokenScopes);
    }

    /**
     * Returns a time-limited HTTPS link to an output file of the specified format.
     * Note: The link will expire 30 days after the date of processing completion.
     * @async
     * @param {string} photosceneid Specifies the ID of the photoscene to download the output
     * @returns {Promise<IPhotoSceneOutput|IPhotoSceneError>} A JSON object containing time-bound HTTPS link to the output file.
     * @throws Error when the request fails, for example, due to invalid request.
     */
    async getPhotoScene(photosceneid: string, format: OutputFormat): Promise<IPhotoSceneOutput|IPhotoSceneError> {
        return this.get(`photoscene/${photosceneid}?format=${format}`, {}, ReadTokenScopes);
    }

    /**
     * Aborts the processing of a photoscene and marks it as cancelled.
     * @async
     * @param {string} photosceneid Specifices the ID of the photoscene to cancel.
     * @returns {IPhotoSceneCancelDelete|IPhotoSceneError} A JSON object containing information on cancelled job.
     * @throws Error when the request fails, for example, due to invalid request.
     */
    async cancelPhotoScene(photosceneid: string): Promise<IPhotoSceneCancelDelete|IPhotoSceneError> {
        const headers: { [key: string]: string } = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return this.post(`photoscene/${photosceneid}/cancel`, {}, headers, WriteTokenScopes);
    }

    /**
     * Deletes a photoscene and its associated assets (images, output files, ...).
     * @async
     * @param {string} photosceneid Specifices the ID of the photoscene to delete.
     * @returns {IPhotoSceneCancelDelete|IPhotoSceneError} A JSON object containing information on deleted job.
     * @throws Error when the request fails, for example, due to invalid request.
     */
    async deletePhotoScene(photosceneid: string): Promise<IPhotoSceneCancelDelete|IPhotoSceneError> {
        const headers: { [key: string]: string } = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return this.delete(`photoscene/${photosceneid}`, headers, WriteTokenScopes);
    }

}