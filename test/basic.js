const { AuthenticationClient, DataManagementClient } = require('..');

async function test() {
    const authClient = new AuthenticationClient();
    const dataClient = new DataManagementClient(authClient);
    try {
        for await (const bucket of await dataClient.buckets()) {
            for await (const object of dataClient.objects(bucket.bucketKey)) {
                console.log('[' + bucket.bucketKey + ']', object.objectId);
            }
        }
    } catch(err) {
        console.error('Error when getting buckets', err);
    }
}

test();