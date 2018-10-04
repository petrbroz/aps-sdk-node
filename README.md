# autodesk-forge-tools [![Build Status](https://travis-ci.org/petrbroz/autodesk-forge-tools.svg?branch=master)](https://travis-ci.org/petrbroz/autodesk-forge-tools)

Tools for accessing [Autodesk Forge](https://developer.autodesk.com/) APIs from Node.js apps.

## Usage

Every API class expects Forge client ID and client secret as arguments
to the constructor. If the credentials are not provided, the code will
attempt to obtain them from environment variables FORGE_CLIENT_ID
and FORGE_CLIENT_SECRET.

### Data Management Client

```js
const dataClient = new DataManagementClient();
try {
    const buckets = await dataClient.buckets();
    for (const bucket of buckets) {
        for await (const page of dataClient.objects(bucket.bucketKey, 4)) {
            console.log('Bucket', bucket.bucketKey, 'page', page);
        }
    }
} catch(err) {
    console.error('Error when getting buckets', err);
}
```

## Testing

`FORGE_CLIENT_ID=<your-client-id> FORGE_CLIENT_SECRET=<your-client-secret> npm run test`