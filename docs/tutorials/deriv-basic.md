# Basic usage of model derivative APIs

```js
const { ModelDerivativeClient, AuthenticationClient } = require('autodesk-forge-tools');
const derivatives = new ModelDerivativeClient(new AuthenticationClient());
const job = await derivatives.submitJob('<your-document-urn>', [{ type: 'svf', views: ['2d', '3d'] }]);
console.log('Job', job);
```