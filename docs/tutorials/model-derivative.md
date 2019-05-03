# Basic usage of Model Derivative APIs

```js
const { ModelDerivativeClient } = require('forge-nodejs-utils');
// Assuming FORGE_CLIENT_ID and FORGE_CLIENT_SECRET are available as env. vars
const derivatives = new ModelDerivativeClient();
const job = await derivatives.submitJob('<your-document-urn>', [{ type: 'svf', views: ['2d', '3d'] }]);
console.log('Job', job);
```
