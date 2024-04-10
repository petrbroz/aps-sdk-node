# Basic usage of Design Automation APIs

```js
const { DesignAutomationClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const client = new DesignAutomationClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
const bundles = await client.listAppBundles();
console.log('App bundles', bundles);
```

## Creating new app bundle

```js
const { DesignAutomationClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const client = new DesignAutomationClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
await client.createAppBundle('<new appbundle name>', '<one of the engine IDs>');
```
