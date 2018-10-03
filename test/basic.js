const { DataManagementClient } = require('..');

async function test() {
    const dataClient = new DataManagementClient();
    try {
        const buckets = await dataClient.buckets();
        for (const bucket of buckets) {
            const objects = await dataClient.objects(bucket.bucketKey);
            console.log('Bucket', bucket.bucketKey, 'objects', objects);
        }
    } catch(err) {
        console.error('Error when getting buckets', err);
    }
}

test();