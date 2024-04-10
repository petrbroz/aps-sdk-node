# Basic usage of Model Derivative APIs

```js
const { ModelDerivativeClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const derivatives = new ModelDerivativeClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
const job = await derivatives.submitJob('<your-document-urn>', [{ type: 'svf', views: ['2d', '3d'] }]);
console.log('Job', job);
```
