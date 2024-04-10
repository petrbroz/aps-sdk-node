# Basic usage of Authentication APIs

```js
const { AuthenticationClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const auth = new AuthenticationClient(APS_CLIENT_ID, APS_CLIENT_SECRET);
const authentication = await auth.authenticate(['bucket:read', 'data:read']);
console.log('2-legged Token', authentication.access_token);
```
