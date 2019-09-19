import Zip from 'adm-zip';

export enum AssetType {
    Image = 'Autodesk.CloudPlatform.Image',
    PropertyViewables = 'Autodesk.CloudPlatform.PropertyViewables',
    PropertyOffsets = 'Autodesk.CloudPlatform.PropertyOffsets',
    PropertyAttributes = 'Autodesk.CloudPlatform.PropertyAttributes',
    PropertyValues = 'Autodesk.CloudPlatform.PropertyValues',
    PropertyIDs = 'Autodesk.CloudPlatform.PropertyIDs',
    PropertyAVs = 'Autodesk.CloudPlatform.PropertyAVs',
    PropertyRCVs = 'Autodesk.CloudPlatform.PropertyRCVs',
    ProteinMaterials = 'ProteinMaterials',
    PackFile = 'Autodesk.CloudPlatform.PackFile',
    FragmentList = 'Autodesk.CloudPlatform.FragmentList',
    GeometryMetadataList = 'Autodesk.CloudPlatform.GeometryMetadataList',
    InstanceTree = 'Autodesk.CloudPlatform.InstanceTree'
}

/**
 * Top-level manifest containing URIs and types of all assets
 * referenced by or embedded in a specific SVF file.
 * The URIs are typically relative to the SVF file itself.
 */
export interface ISvfManifest {
    name: string;
    manifestversion: number;
    toolkitversion: string;
    assets: ISvfManifestAsset[];
    typesets: ISvfManifestTypeSet[];
}

/**
 * Description of a specific asset referenced by or embedded in an SVF,
 * including the URI, compressed and uncompressed size, type of the asset itself,
 * and types of all entities inside the asset.
 */
export interface ISvfManifestAsset {
    id: string;
    type: AssetType;
    typeset?: string;
    URI: string;
    size: number;
    usize: number;
}

/**
 * Collection of type definitions.
 */
export interface ISvfManifestTypeSet {
    id: string;
    types: ISvfManifestType[];
}

/**
 * Single type definition.
 */
export interface ISvfManifestType {
    class: string;
    type: string;
    version: number;
}

/**
 * Additional metadata for SVF such as the definition of "up" vector,
 * default background, etc.
 */
export interface ISvfMetadata {
    version: string;
    metadata: { [key: string]: any };
}

/**
 * Parses SVF manifest and metadata from a binary buffer.
 * @param {Buffer} buffer Binary buffer to parse.
 * @returns {{ manifest: ISvfManifest, metadata: ISvfMetadata }} Parsed manifest and metadata.
 */
export function parseManifest(buffer: Buffer): { manifest: ISvfManifest, metadata: ISvfMetadata } {
    const zip = new Zip(buffer);
    const manifest = JSON.parse(zip.getEntry('manifest.json').getData().toString()) as ISvfManifest;
    const metadata = JSON.parse(zip.getEntry('metadata.json').getData().toString()) as ISvfMetadata;
    return { manifest, metadata };
}
