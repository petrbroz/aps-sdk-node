import Zip from 'adm-zip';

export interface ISvfManifest {
    name: string;
    manifestversion: number;
    toolkitversion: string;
    assets: ISvfManifestAsset[];
    typesets: ISvfManifestTypeSet[];
}

export interface ISvfManifestAsset {
    id: string;
    type: string;
    typeset?: string;
    URI: string;
    size: number;
    usize: number;
}

export interface ISvfManifestTypeSet {
    id: string;
    types: ISvfManifestType[];
}

export interface ISvfManifestType {
    class: string;
    type: string;
    version: number;
}

export interface ISvfMetadata {
    version: string;
    metadata: { [key: string]: any };
}

export function parse(svf: Buffer): { manifest: ISvfManifest, metadata: ISvfMetadata } {
    const zip = new Zip(svf);
    const manifest = JSON.parse(zip.getEntry('manifest.json').getData().toString()) as ISvfManifest;
    const metadata = JSON.parse(zip.getEntry('metadata.json').getData().toString()) as ISvfMetadata;
    return { manifest, metadata };
}
