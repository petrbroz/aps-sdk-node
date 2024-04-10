# Basic usage of Data Management APIs

```js
const { DataManagementClient } = require('aps-sdk-node');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
const data = new DataManagementClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });

const buckets = await data.listBuckets();
console.log('Buckets', buckets.map(bucket => bucket.bucketKey).join(','));

const objects = await data.listObjects('foo-bucket');
console.log('Objects', objects.map(object => object.objectId).join(','));
```
