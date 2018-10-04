const { DataManagementClient } = require('..');

async function test() {
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
}

test();