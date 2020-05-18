# Basic usage of Reality Capture APIs

```js
const { RealityCaptureClient } = require('forge-server-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const recap = new RealityCaptureClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
const photoscene = await recap.createPhotoScene('<scenename>', '<callback>', '<format>', '<scenetype>');
console.log('Photoscene', photoscene);
```
