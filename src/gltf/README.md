# glTF

> Note: for now, the code in this folder is excluded from the webpack config
> to avoid issues when bundling for browsers. This could change in the future.

This subfolder provides additional utilities for serializing Forge models into glTF.

## Usage

### In Node.js

```js
const { ModelDerivativeClient, ManifestHelper } = require('forge-server-utils');
const { Parser } = require('forge-server-utils/dist/svf');
const { serialize } = require('forge-server-utils/dist/gltf');

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;

async function run(urn) {
    // Find all SVF derivatives for Model Derivative URN
    const auth = { client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET };
    const modelDerivativeClient = new ModelDerivativeClient(auth);
    const helper = new ManifestHelper(await modelDerivativeClient.getManifest(urn));
    const derivatives = helper.search({ type: 'resource', role: 'graphics' });
    for (const derivative of derivatives.filter(derivative => derivative.mime === 'application/autodesk-svf')) {
        // Parse each derivative and serialize into glTF
        const parser = await Parser.FromDerivativeService(urn, derivative.guid, auth);
        const svf = await parser.parse();
        serialize(svf, `tmp/${urn}`);
    }
}

run('your model urn');
```
