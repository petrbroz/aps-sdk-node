export * from './manifest';
export * from './fragment';
export * from './geometry';
export * from './material';
export * from './mesh';
export * from './parser';

import * as path from 'path';
import * as fse from 'fs-extra';
import { ManifestHelper } from '..';
import { ModelDerivativeClient, IDerivativeResourceChild } from '../model-derivative';
import { parseManifest } from './manifest';

/**
 * Downloads all SVF viewables of Forge model to local folder.
 * @async
 * @param {string} urn Forge model URN.
 * @param {string} outputDir Output folder. The method will create subfolders for the URN and all viewable GUIDs.
 * @param {ModelDerivativeClient} client Client for accessing model derivatives.
 */
export async function downloadViewables(urn: string, outputDir: string, client: ModelDerivativeClient) {
    const helper = new ManifestHelper(await client.getManifest(urn));
    const derivatives = helper.search({ type: 'resource', role: 'graphics' }) as IDerivativeResourceChild[];
    let tasks = [];
    for (const derivative of derivatives.filter(d => d.mime === 'application/autodesk-svf')) {
        tasks.push(downloadViewable(urn, derivative.guid, outputDir, client));
    }
    await Promise.all(tasks);
}

/**
 * Downloads specific SVF viewable of Forge model to local folder.
 * @async
 * @param {string} urn Forge model URN.
 * @param {string} guid SVF viewable GUID.
 * @param {string} outputDir Output folder. The method will create subfolders for the URN and the viewable GUID.
 * @param {ModelDerivativeClient} client Client for accessing model derivatives.
 */
export async function downloadViewable(urn: string, guid: string, outputDir: string, client: ModelDerivativeClient) {
    const helper = new ManifestHelper(await client.getManifest(urn));
    const derivatives = helper.search({ guid });
    if (derivatives.length === 0) {
        throw new Error('Guid not found in manifest.')
    }
    const derivative = derivatives[0] as IDerivativeResourceChild;
    const urnDir = path.join(outputDir, urn);
    fse.ensureDirSync(urnDir);
    const guidDir = path.join(urnDir, derivative.guid);
    fse.ensureDirSync(guidDir);
    const svf = await client.getDerivative(urn, derivative.urn);
    fse.writeFileSync(path.join(guidDir, 'output.svf'), svf);
    const baseUri = derivative.urn.substr(0, derivative.urn.lastIndexOf('/'));
    const { manifest, metadata } = parseManifest(svf as Buffer);
    fse.writeFileSync(path.join(guidDir, 'metadata.json'), JSON.stringify(metadata));
    let tasks = [];
    for (const asset of manifest.assets) {
        if (asset.URI.startsWith('embed:')) {
            continue;
        }
        const assetPath = path.join(guidDir, asset.URI);
        tasks.push(downloadViewableAsset(urn, baseUri + '/' + asset.URI, assetPath, client));
    }
    await Promise.all(tasks);
}

async function downloadViewableAsset(urn: string, assetUri: string, assetPath: string, client: ModelDerivativeClient) {
    const assetFolder = path.dirname(assetPath);
    const assetData = await client.getDerivative(urn, assetUri);
    fse.ensureDirSync(assetFolder);
    fse.writeFileSync(assetPath, assetData);
}
