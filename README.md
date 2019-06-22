# forge-nodejs-utils [![Build Status](https://travis-ci.org/petrbroz/forge-nodejs-utils.svg?branch=master)](https://travis-ci.org/petrbroz/forge-nodejs-utils) [![npm version](https://badge.fury.io/js/forge-nodejs-utils.svg)](https://badge.fury.io/js/forge-nodejs-utils)

Unofficial tools for accessing [Autodesk Forge](https://developer.autodesk.com/) APIs
from Node.js applications, using modern language features like
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
or [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).

## Usage

### Authentication

If you need to generate [2-legged tokens](https://forge.autodesk.com/en/docs/oauth/v2/tutorials/get-2-legged-token)
manually, you can use the `AuthenticationClient` class:

```js
const { AuthenticationClient } = require('forge-nodejs-utils');
const auth = new AuthenticationClient(process.env.FORGE_CLIENT_ID, process.env.FORGE_CLIENT_SECRET);
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
const data = new DataManagementClient({ client_id: process.env.FORGE_CLIENT_ID, client_secret: process.env.FORGE_CLIENT_SECRET });

const buckets = await data.listBuckets();
console.log('Buckets', buckets.map(bucket => bucket.bucketKey).join(','));

const objects = await data.listObjects('foo-bucket');
console.log('Objects', objects.map(object => object.objectId).join(','));
```

### Model Derivatives

```js
const { ModelDerivativeClient } = require('forge-nodejs-utils');
const derivatives = new ModelDerivativeClient({ client_id: process.env.FORGE_CLIENT_ID, client_secret: process.env.FORGE_CLIENT_SECRET });
const job = await derivatives.submitJob('<your-document-urn>', [{ type: 'svf', views: ['2d', '3d'] }]);
console.log('Job', job);
```

### Design Automation

```js
const { DesignAutomationClient, AuthenticationClient } = require('forge-nodejs-utils');
const client = new DesignAutomationClient({ client_id: process.env.FORGE_CLIENT_ID, client_secret: process.env.FORGE_CLIENT_SECRET });
const bundles = await client.listAppBundles();
console.log('App bundles', bundles);
```

## Testing

```bash
export FORGE_CLIENT_ID=<your-client-id>
export FORGE_CLIENT_SECRET=<your-client-secret>
export FORGE_BUCKET=<your-test-bucket>
export FORGE_MODEL_URN=<testing-model-urn>
npm test
```
