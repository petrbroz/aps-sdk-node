# autodesk-forge-tools [![Build Status](https://travis-ci.org/petrbroz/autodesk-forge-tools.svg?branch=master)](https://travis-ci.org/petrbroz/autodesk-forge-tools)

Tools for accessing [Autodesk Forge](https://developer.autodesk.com/) APIs from Node.js apps.

## Usage

### Authentication

```js
const auth = new AuthenticationClient(); // If no params, gets credentials from env. vars FORGE_CLIENT_ID and FORGE_CLIENT_SECRET
const token = await auth.authenticate(['bucket:read', 'data:read']);
console.log('2-legged Token', token);
```

### Data Management

```js
const data = new DataManagementClient(new AuthenticationClient());
// List buckets
for await (const buckets of await data.buckets()) {
    for (const bucket of buckets) {
        console.log('Bucket', bucket.bucketKey);
    }
}
// List objects in $FORGE_BUCKET
for await (const objects of data.objects(FORGE_BUCKET)) {
    for (const object of objects) {
        console.log('Object', object.objectId);
    }
}
```

## Testing

```bash
export FORGE_CLIENT_ID=<your-client-id>
export FORGE_CLIENT_SECRET=<your-client-secret>
npm test
```