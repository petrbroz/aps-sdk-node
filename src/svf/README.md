# SVF

> Note: for now, the code in this folder is excluded from the webpack config
> to avoid issues when bundling for browsers. This could change in the future.

This subfolder provides additional utilities for parsing _SVF_
(the proprietary file format used by the Forge Viewer), either from Model Derivative
service, or from local folder.

## Usage

### In Node.js

```js
const { ModelDerivativeClient, ManifestHelper } = require('forge-server-utils');
const { Parser } = require('forge-server-utils/dist/svf');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const URN = 'dX...';
const AUTH = { client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET };

// Find SVF derivatives in a Model Derivative URN
const modelDerivativeClient = new ModelDerivativeClient(AUTH);
const helper = new ManifestHelper(await modelDerivativeClient.getManifest(URN));
const derivatives = helper.search({ type: 'resource', role: 'graphics' });

// Parse each derivative
for (const derivative of derivatives.filter(d => d.mime === 'application/autodesk-svf')) {
    const parser = await Parser.FromDerivativeService(URN, derivative.guid, AUTH);
    // Enumerate fragments with an async iterator
    for await (const fragment of parser.enumerateFragments()) {
        console.log(JSON.stringify(fragment));
    }
    // Or collect all fragments in memory
    console.log(await parser.listFragments());
}
```

```js
const { Parser } = require('forge-server-utils/dist/svf');

// Parse SVF from local folder
const parser = await Parser.FromFileSystem('foo/bar.svf');
// Parse the property database and query properties of root object
const propdb = await parser.getPropertyDb();
console.log(propdb.findProperties(1));
```

Or just download all SVFs (in parallel) of given model to your local folder:

```js
const { ModelDerivativeClient } = require('forge-server-utils');
const { downloadViewables } = require('forge-server-utils/dist/svf');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;

const modelDerivativeClient = new ModelDerivativeClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
await downloadViewables('your model urn', 'path/to/output/folder', modelDerivativeClient);
```
