# autodesk-forge-tools [![Build Status](https://travis-ci.org/petrbroz/autodesk-forge-tools.svg?branch=master)](https://travis-ci.org/petrbroz/autodesk-forge-tools)

Tools for accessing [Autodesk Forge](https://developer.autodesk.com/) APIs from Node.js apps.

## Usage

Every API class expects Forge client ID and client secret as arguments
to the constructor. If the credentials are not provided, the code will
attempt to obtain them from environment variables FORGE_CLIENT_ID
and FORGE_CLIENT_SECRET.

### Data Management Client

```js
const data = new DataManagementClient(new AuthenticationClient());
try {
    for await (const bucket of await data.buckets()) {
        for await (const object of data.objects(bucket.bucketKey)) {
            console.log('[' + bucket.bucketKey + ']', object.objectId);
        }
    }
} catch(err) {
    console.error('Error when listing buckets/objects', err);
}
```

## Testing

`FORGE_CLIENT_ID=<your-client-id> FORGE_CLIENT_SECRET=<your-client-secret> npm run test`