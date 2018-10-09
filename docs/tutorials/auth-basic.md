# Basic usage of authentication APIs

```js
const { AuthenticationClient } = require('autodesk-forge-tools');
const auth = new AuthenticationClient(); // If no params, gets credentials from env. vars FORGE_CLIENT_ID and FORGE_CLIENT_SECRET
const authentication = await auth.authenticate(['bucket:read', 'data:read']);
console.log('2-legged Token', authentication.access_token);
```