# SVF

This subfolder contains utilities for working with SVF, the file format used to represent 3D content
in [Autodesk Forge](https://forge.autodesk.com).

> Note: for now, the code in this folder is excluded from the webpack config
> to avoid issues when bundling for browsers. This could change in the future.

## Usage

```js
const { parseManifest } = require('forge-server-utils/svf');

const modelDerivativeClient = new ModelDerivativeClient({ client_id: '<your client id>', client_secret: '<your client secret>' });

async function run(urn) {
    // Fetch manifest for specific urn and find all SVF derivatives
    const manifest = await modelDerivativeClient.getManifest(urn);
    const helper = new ManifestHelper(manifest);
    const derivatives = helper.search({ type: 'resource', role: 'graphics' });
    for (const derivative of derivatives.filter(deriv => deriv.mime === 'application/autodesk-svf')) {
        // Fetch each SVF derivative and parse its contents
        const svf = await modelDerivativeClient.getDerivative(urn, derivative.urn);
        const { manifest, metadata } = parseManifest(svf);
        console.log('Manifest', manifest);
        console.log('Metadata', metadata);
        for (const asset of manifest.assets) {
            console.log('Asset', asset);
        }
    }
}

run();
```
