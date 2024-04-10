# aps-sdk-node

![Publish to NPM](https://github.com/petrbroz/aps-sdk-node/workflows/Publish%20to%20NPM/badge.svg)
[![npm version](https://badge.fury.io/js/aps-sdk-node.svg)](https://badge.fury.io/js/aps-sdk-node)
![node](https://img.shields.io/node/v/aps-sdk-node.svg)
![npm downloads](https://img.shields.io/npm/dw/aps-sdk-node.svg)
![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)

Unofficial SDK for accessing [Autodesk Platform Services](https://aps.autodesk.com/) from Node.js applications
and from browsers, built using [TypeScript](https://www.typescriptlang.org) and modern language features like
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
or [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).

![Autodesk Platform Services](docs/logo.png)

## Usage

### Server Side

The TypeScript implementation is transpiled into CommonJS JavaScript module with type definition files,
so you can use it both in Node.js projects, and in TypeScript projects:

```js
// JavaScript
const { DataManagementClient } = require('aps-sdk-node');
```

```ts
// TypeScript
import {
	DataManagementClient,
	IBucket,
	IObject,
	IResumableUploadRange,
	DataRetentionPolicy
} from 'aps-sdk-node';
```

#### Authentication

If you need to generate [2-legged tokens](https://aps.autodesk.com/en/docs/oauth/v2/tutorials/get-2-legged-token)
manually, you can use the `AuthenticationClient` class:

```js
const { AuthenticationClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const auth = new AuthenticationClient(APS_CLIENT_ID, APS_CLIENT_SECRET);
const authentication = await auth.authenticate(['bucket:read', 'data:read']);
console.log('2-legged token', authentication.access_token);
```

Other API clients in this library are typically configured using a simple JavaScript object
containing either `client_id` and `client_secret` properties (for 2-legged authentication),
or a single `token` property (for authentication using a pre-generated access token):

```js
const { DataManagementClient, BIM360Client } = require('aps-sdk-node');
const dm = new DataManagementClient({ client_id: '...', client_secret: '...' });
const bim360 = new BIM360Client({ token: '...' });
```

#### Data Management

```js
const { DataManagementClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const data = new DataManagementClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });

const buckets = await data.listBuckets();
console.log('Buckets', buckets.map(bucket => bucket.bucketKey).join(','));

const objects = await data.listObjects('foo-bucket');
console.log('Objects', objects.map(object => object.objectId).join(','));
```

#### Model Derivatives

```js
const { ModelDerivativeClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const derivatives = new ModelDerivativeClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
const job = await derivatives.submitJob('<your-document-urn>', [{ type: 'svf', views: ['2d', '3d'] }]);
console.log('Job', job);
```

#### Design Automation

```js
const { DesignAutomationClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const client = new DesignAutomationClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
const bundles = await client.listAppBundles();
console.log('App bundles', bundles);
```

#### Reality Capture

```js
const { OutputFormat, RealityCaptureClient, SceneType } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const recap = new RealityCaptureClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
const options = {
    scenename: '<scene name>',
    scenetype: SceneType.Aerial,
    format: OutputFormat.RecapPhotoMesh,
    callback: '<callback>'
};
const photoscene = await recap.createPhotoScene(options);
console.log('Photoscene', photoscene);
```

### Client Side (experimental)

The transpiled output from TypeScript is also bundled using [webpack](https://webpack.js.org),
so you can use the same functionality in a browser. There is a caveat, unfortunately: at the moment
it is not possible to request APS access tokens from the browser
due to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) limitations,
so when creating instances of the various clients, instead of providing client ID and secret
you will have to provide the token directly.

```html
<script src="https://cdn.jsdelivr.net/npm/aps-sdk-node/dist/browser/aps-sdk-node.js"></script>
<script>
	const data = new APS.DataManagementClient({ token: '<your access token>' });
	const deriv = new APS.ModelDerivativeClient({ token: '<your access token>' });
	data.listBuckets()
		.then(buckets => { console.log('Buckets', buckets); })
		.catch(err => { console.error('Could not list buckets', err); });
	deriv.submitJob('<your document urn>', [{ type: 'svf', views: ['2d', '3d'] }])
		.then(job => { console.log('Translation job', job); })
		.catch(err => { console.error('Could not start translation', err); });
</script>
```

Note that you can also request a specific version of the library from CDN by appending `@<version>`
to the npm package name, for example, `https://cdn.jsdelivr.net/npm/aps-sdk-node@4.0.0/dist/browser/aps-sdk-node.js`.

## Testing

```bash
export APS_CLIENT_ID=<your-client-id>
export APS_CLIENT_SECRET=<your-client-secret>
export APS_BUCKET=<your-test-bucket>
export APS_MODEL_URN=<testing-model-urn>
yarn run build # Transpile TypeScript into JavaScript
yarn test
```
