# Basic usage of Reality Capture APIs

```js
const { OutputFormat, RealityCaptureClient, SceneType } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const recap = new RealityCaptureClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
const options = {
    scenename: '<scene name>',
    scenetype: SceneType.Aerial,
    format: OutputFormat.RecapPhotoMesh,
    callback: '<callback>'
};
const photoscene = await recap.createPhotoScene(options);
console.log('Photoscene', photoscene);
```
