# Basic usage of design automation APIs

```js
const { DesignAutomationClient, AuthenticationClient } = require('forge-nodejs-utils');
const client = new DesignAutomationClient(new AuthenticationClient());
const bundles = await client.listAppBundles();
console.log('App bundles', bundles);
```

## Creating new app bundle

```js
const { DesignAutomationClient, AuthenticationClient } = require('forge-nodejs-utils');
const client = new DesignAutomationClient(new AuthenticationClient());
await client.createAppBundle('<appbundle name>', '<appbundle description>', '<one of the engine IDs>');
```
