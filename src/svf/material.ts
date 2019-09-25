import * as zlib from 'zlib';

export interface IMaterials {
    name: string;
    version: string;
    scene: { [key: string]: any };
    materials: { [key: string]: IMaterialGroup };
}

export interface IMaterialGroup {
    version: number;
    userassets: string[];
    materials: { [key: string]: IMaterial };
}

export interface IMaterial {
    tag: string;
    proteinType: string;
    definition: string;
    transparent: boolean;
    keywords?: string[];
    categories?: string[];
    properties: {
        integers?: { [key: string]: number; };
        booleans?: { [key: string]: boolean; };
        strings?: { [key: string]: { values: string[] }; };
        uris?: { [key: string]: { values: string[] }; };
        scalars?: { [key: string]: { units: string; values: number[] }; };
        colors?: { [key: string]: { values: { r: number; g: number; b: number; a: number; }[] }; };
        textures?: { [key: string]: { connections: string[] }; };
        choicelists?: { [key: string]: { values: number[] }; };
        uuids?: { [key: string]: { values: number[] }; };
        references?: any; // TODO
    };
}

/**
 * Parses materials from a binary buffer, typically stored in a file called 'Materials.json.gz',
 * referenced in the SVF manifest as an asset of type 'ProteinMaterials'.
 * @param {Buffer} buffer Binary buffer to parse.
 * @returns {IMaterials | null} Instances of parsed materials, or null if there are none.
 */
export function parseMaterials(buffer: Buffer): IMaterials | null {
    if (buffer[0] === 31 && buffer[1] === 139) {
        buffer = zlib.gunzipSync(buffer);
    }
    if (buffer.byteLength > 0) {
        return JSON.parse(buffer.toString());
    } else {
        return null;
    }
}
