# Basic usage of data APIs

```js
const { DataManagementClient, AuthenticationClient } = require('autodesk-forge-tools');
const data = new DataManagementClient(new AuthenticationClient());
// List buckets
for await (const buckets of await data.buckets()) {
    console.log('Buckets', buckets.map(bucket => bucket.bucketKey).join(','));
}
// List objects in bucket
for await (const objects of data.objects("foo-bucket")) {
    console.log('Objects', objects.map(object => object.objectId).join(','));
}
```