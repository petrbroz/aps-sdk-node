# Basic usage of Reality Capture APIs

```js
const { OutputFormat, RealityCaptureClient, SceneType } = require('forge-server-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
const recap = new RealityCaptureClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
const options = {
    scenename: '<scene name>',
    scenetype: SceneType.Aerial,
    format: OutputFormat.RecapPhotoMesh,
    callback: '<callback>'
};
const photoscene = await recap.createPhotoScene(options);
console.log('Photoscene', photoscene);
```
