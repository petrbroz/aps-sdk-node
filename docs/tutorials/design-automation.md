# Basic usage of Design Automation APIs

```js
const { DesignAutomationClient } = require('forge-nodejs-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const client = new DesignAutomationClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
const bundles = await client.listAppBundles();
console.log('App bundles', bundles);
```

## Creating new app bundle

```js
const { DesignAutomationClient } = require('forge-nodejs-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const client = new DesignAutomationClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
await client.createAppBundle('<appbundle name>', '<appbundle description>', '<one of the engine IDs>');
```
