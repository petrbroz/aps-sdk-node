# Basic usage of Design Automation APIs

```js
const { DesignAutomationClient } = require('forge-nodejs-utils');
// Assuming FORGE_CLIENT_ID and FORGE_CLIENT_SECRET are available as env. vars
const client = new DesignAutomationClient();
const bundles = await client.listAppBundles();
console.log('App bundles', bundles);
```

## Creating new app bundle

```js
const { DesignAutomationClient } = require('forge-nodejs-utils');
// Assuming FORGE_CLIENT_ID and FORGE_CLIENT_SECRET are available as env. vars
const client = new DesignAutomationClient();
await client.createAppBundle('<appbundle name>', '<appbundle description>', '<one of the engine IDs>');
```
