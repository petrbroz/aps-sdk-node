# Basic usage of Data Management APIs

```js
// Assuming FORGE_CLIENT_ID and FORGE_CLIENT_SECRET are available as env. vars

const { DataManagementClient } = require('forge-nodejs-utils');
const data = new DataManagementClient();

const buckets = await data.listBuckets();
console.log('Buckets', buckets.map(bucket => bucket.bucketKey).join(','));

const objects = await data.listObjects('foo-bucket');
console.log('Objects', objects.map(object => object.objectId).join(','));
```
