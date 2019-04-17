# Basic usage of design automation APIs

```js
const { DesignAutomationClient, AuthenticationClient } = require('forge-nodejs-utils');
const client = new DesignAutomationClient(new AuthenticationClient());
// List appbundles
for await (const appbundles of client.appbundles()) {
    console.log('AppBundles', appbundles);
}
```

## Creating new app bundle

```js
const { DesignAutomationClient, AuthenticationClient } = require('forge-nodejs-utils');
const client = new DesignAutomationClient(new AuthenticationClient());
await client.createAppBundle('<appbundle name>', '<appbundle description>', '<one of the engine IDs>');
```
