const { AuthenticationClient, DataManagementClient } = require('..');

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_BUCKET } = process.env;

async function test() {
    const authClient = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
    const dataClient = new DataManagementClient(authClient);
    try {
        // List buckets
        for await (const buckets of await dataClient.buckets()) {
            for (const bucket of buckets) {
                console.log('Bucket', bucket.bucketKey);
            }
        }
        // List objects in $FORGE_BUCKET
        for await (const objects of dataClient.objects(FORGE_BUCKET)) {
            for (const object of objects) {
                console.log('Object', object.objectId);
            }
        }
    } catch(err) {
        console.error('Error when getting buckets', err);
    }
}

test();