# Basic usage of Authentication APIs

```js
const { AuthenticationClient } = require('forge-nodejs-utils');
// Assuming FORGE_CLIENT_ID and FORGE_CLIENT_SECRET are available as env. vars
const auth = new AuthenticationClient();
const authentication = await auth.authenticate(['bucket:read', 'data:read']);
console.log('2-legged Token', authentication.access_token);
```
