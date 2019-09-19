import * as zlib from 'zlib';

export interface IMaterial { [key: string]: any }; // TODO

/**
 * Parses materials from a binary buffer, typically stored in a file called 'Materials.json.gz',
 * referenced in the SVF manifest as an asset of type 'ProteinMaterials'.
 * @generator
 * @param {Buffer} buffer Binary buffer to parse.
 * @returns {Iterable<IMaterial>} Instances of parsed materials.
 */
export function *parseMaterials(buffer: Buffer): Iterable<IMaterial> {
    if (buffer[0] === 31 && buffer[1] === 139) {
        buffer = zlib.gunzipSync(buffer);
    }
    const json = JSON.parse(buffer.toString());
    for (const key of Object.keys(json.materials)) {
        const group = json.materials[key];
        yield group.materials[group.userassets[0]];
    }
}
