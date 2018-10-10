# autodesk-forge-tools [![Build Status](https://travis-ci.org/petrbroz/autodesk-forge-tools.svg?branch=master)](https://travis-ci.org/petrbroz/autodesk-forge-tools) [![npm version](https://badge.fury.io/js/autodesk-forge-tools.svg)](https://badge.fury.io/js/autodesk-forge-tools)

Unofficial tools for accessing [Autodesk Forge](https://developer.autodesk.com/) APIs
from Node.js applications, using modern language features like
[async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
or [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).

## Usage

### Authentication

```js
const { AuthenticationClient } = require('autodesk-forge-tools');
const auth = new AuthenticationClient(); // If no params, gets credentials from env. vars FORGE_CLIENT_ID and FORGE_CLIENT_SECRET
const authentication = await auth.authenticate(['bucket:read', 'data:read']);
console.log('2-legged Token', authentication.access_token);
```

### Data Management

```js
const { DataManagementClient, AuthenticationClient } = require('autodesk-forge-tools');
const data = new DataManagementClient(new AuthenticationClient());
// List buckets
for await (const buckets of await data.buckets()) {
    console.log('Buckets', buckets.map(bucket => bucket.bucketKey).join(','));
}
// List objects in bucket
for await (const objects of data.objects('foo-bucket')) {
    console.log('Objects', objects.map(object => object.objectId).join(','));
}
```

### Model Derivatives

```js
const { ModelDerivativeClient, AuthenticationClient } = require('autodesk-forge-tools');
const derivatives = new ModelDerivativeClient(new AuthenticationClient());
const job = await derivatives.submitJob('<your-document-urn>', [{ type: 'svf', views: ['2d', '3d'] }]);
console.log('Job', job);
```

## Testing

```bash
export FORGE_CLIENT_ID=<your-client-id>
export FORGE_CLIENT_SECRET=<your-client-secret>
export FORGE_BUCKET=<your-test-bucket>
npm test
```