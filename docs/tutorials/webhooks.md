# Basic usage of Webhooks APIs

```js
const { WebhooksClient, WebhookSystem, WebhookEvent } = require('forge-server-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const webhooks = new WebhooksClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
async function run() {
    // Enumerate through paginated webhooks
    for await (const hooks of webhooks.iterateHooks()) {
        console.log(hooks);
    }
    // Create new webhook for when a folder is deleted
    const webhook = await webhooks.createHook(WebhookSystem.Data, WebhookEvent.DataFolderDeleted, {
        callbackUrl: 'http://bf067e05.ngrok.io/callback',
        scope: { folder: 'urn:adsk.wipprod:fs.folder:co.wT5lCWlXSKeo3razOfHJAw' },
        hookAttribute: {
            foo: 33,
            myobject: {
                nested: true
            }
        },
        filter: "$[?(@.ext=='txt')]"
    });
    console.log('New webhook', webhook);
}
run();
```
