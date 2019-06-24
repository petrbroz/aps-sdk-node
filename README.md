# forge-nodejs-utils [![Build Status](https://travis-ci.org/petrbroz/forge-nodejs-utils.svg?branch=master)](https://travis-ci.org/petrbroz/forge-nodejs-utils) [![npm version](https://badge.fury.io/js/forge-nodejs-utils.svg)](https://badge.fury.io/js/forge-nodejs-utils)

Unofficial tools for accessing [Autodesk Forge](https://developer.autodesk.com/) APIs
from Node.js applications, built using [TypeScript](https://www.typescriptlang.org) and modern language features like
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
or [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).

## Usage

The TypeScript implementation is transpiled into JavaScript with type definition files,
so you can use it both in Node.js projects (as a CommonJS module), and in TypeScript projects (as an ES6 module):

```js
// JavaScript
const { DataManagementClient } = require('forge-nodejs-utils');
```

```ts
// TypeScript
import {
	DataManagementClient,
	IBucket,
	IObject,
	IResumableUploadRange,
	DataRetentionPolicy
} from 'forge-nodejs-utils';
```

### Authentication

If you need to generate [2-legged tokens](https://forge.autodesk.com/en/docs/oauth/v2/tutorials/get-2-legged-token)
manually, you can use the `AuthenticationClient` class:

```js
const { AuthenticationClient } = require('forge-nodejs-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
const authentication = await auth.authenticate(['bucket:read', 'data:read']);
console.log('2-legged token', authentication.access_token);
```

Other API clients in this library are typically configured using a simple JavaScript object
containing either `client_id` and `client_secret` properties (for 2-legged authentication),
or a single `token` property (for authentication using a pre-generated access token):

```js
const { DataManagementClient, BIM360Client } = require('forge-nodejs-utils');
const dm = new DataManagementClient({ client_id: '...', client_secret: '...' });
const bim360 = new BIM360Client({ token: '...' });
```

### Data Management

```js
const { DataManagementClient } = require('forge-nodejs-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const data = new DataManagementClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });

const buckets = await data.listBuckets();
console.log('Buckets', buckets.map(bucket => bucket.bucketKey).join(','));

const objects = await data.listObjects('foo-bucket');
console.log('Objects', objects.map(object => object.objectId).join(','));
```

### Model Derivatives

```js
const { ModelDerivativeClient } = require('forge-nodejs-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const derivatives = new ModelDerivativeClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
const job = await derivatives.submitJob('<your-document-urn>', [{ type: 'svf', views: ['2d', '3d'] }]);
console.log('Job', job);
```

### Design Automation

```js
const { DesignAutomationClient } = require('forge-nodejs-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const client = new DesignAutomationClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
const bundles = await client.listAppBundles();
console.log('App bundles', bundles);
```

## Testing

```bash
export FORGE_CLIENT_ID=<your-client-id>
export FORGE_CLIENT_SECRET=<your-client-secret>
export FORGE_BUCKET=<your-test-bucket>
export FORGE_MODEL_URN=<testing-model-urn>
npm run build # First transpile TypeScript code is into JavaScript
npm test
```
