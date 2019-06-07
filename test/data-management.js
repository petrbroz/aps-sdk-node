const assert = require('assert');

const { DataManagementClient } = require('..');

describe('DataManagementClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_BUCKET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        assert(FORGE_BUCKET);
        this.client = new DataManagementClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
        this.bucket = FORGE_BUCKET;
        this.timeout(5000); // Increase timeout to 5 seconds
    });

    describe('listBuckets()', function() {
        it('should return a list of buckets', async function() {
            const buckets = await this.client.listBuckets();
            assert(buckets.length > 0);
        });
    });

    describe('iterateBuckets()', function() {
        it('should iterate over buckets', async function() {
            for await (const buckets of this.client.iterateBuckets()) {
                assert(buckets.length > 0);
                break;
            }
        });
    });

    describe('getBucketDetails()', function() {
        it('should return bucket info', async function() {
            const details = await this.client.getBucketDetails(this.bucket);
            assert(details);
            assert(details.bucketKey === this.bucket);
            assert(details.bucketOwner);
            assert(details.createdDate);
            assert(details.permissions);
            assert(details.policyKey);
        });
    });

    describe('createBucket()', function() {
        /* Don't want to create a new bucket on every test run... */
        // it('should create a new bucket', async function() {
        //     const bucket = await this.client.createBucket('test.123456', 'transient');
        //     assert(bucket);
        //     console.log(bucket);
        // });

        it('should fail because a bucket with this name already exists', function(done) {
            this.client.createBucket(this.bucket, 'transient')
                .catch((err) => {
                    //console.log(err);
                    done();
                });
        });
    });

    describe('listObjects()', function() {
        it('should return a list of objects', async function() {
            const objects = await this.client.listObjects(this.bucket);
            assert(objects.length > 0);
        });
        it('should only list objects with given prefix', async function() {
            const prefix = 'p';
            const objects = await this.client.listObjects(this.bucket, prefix);
            for (const obj of objects) {
                assert(obj.objectKey.startsWith(prefix));
            }
        });
    });

    describe('iterateObjects()', function() {
        it('should iterate over objects', async function() {
            for await (const objects of this.client.iterateObjects(this.bucket)) {
                assert(objects.length > 0);
                break;
            }
        });
        it('should only iterate over objects with given prefix', async function() {
            const prefix = 'p';
            for await (const objects of this.client.iterateObjects(this.bucket, 16, prefix)) {
                for (const obj of objects) {
                    assert(obj.objectKey.startsWith(prefix));
                }
            }
        });
    });

    describe('uploadObject()', function() {
        it('should upload object content', async function() {
            const objectName = 'test-file';
            const buff = Buffer.from('This is a test string!', 'utf8');
            const result = await this.client.uploadObject(this.bucket, objectName, 'text/plain; charset=UTF-8', buff);
            assert(result);
            assert(result.location);
            assert(result.location.indexOf(objectName) !== -1);
        });
    });

    describe('downloadObject()', function() {
        it('should download object content', async function() {
            const objectName = 'test-file';
            const content = await this.client.downloadObject(this.bucket, objectName);
            assert(content.indexOf('This is a test string!') === 0);
        });
    });

    describe('getObjectDetails()', function() {
        it('should return object info', async function() {
            const details = await this.client.getObjectDetails(this.bucket, 'test-file');
            assert(details.bucketKey === this.bucket);
            assert(details.objectId);
            assert(details.objectKey === 'test-file');
        });
    });

    describe('createSignedUrl()', function() {
        it('should return signed URL resource info', async function() {
            const info = await this.client.createSignedUrl(this.bucket, 'nonexistent-file');
            assert(info);
            assert(info.signedUrl);
        });
    });

    describe('uploadObjectResumable()', function() {
        it('should upload multiple chunks in one session', async function() {
            const ObjectName = 'forge-nodejs-utils-test-file-' + new Date().toISOString();
            const SessionID = 'test-session';
            const arr = new Uint8Array(5 << 20);
            for (let i = 0; i < arr.length; i++) {
                arr[i] = i % 255;
            }
            let ranges = null;

            this.timeout(10000);

            await this.client.uploadObjectResumable(this.bucket, ObjectName, arr, 0, 10 << 20, SessionID, 'text/plain');
            ranges = await this.client.getResumableUploadStatus(this.bucket, ObjectName, SessionID);
            assert(ranges && ranges.length === 1);
            await this.client.uploadObjectResumable(this.bucket, ObjectName, arr, 5 << 20, 10 << 20, SessionID, 'text/plain');
            ranges = await this.client.getResumableUploadStatus(this.bucket, ObjectName, SessionID);
            assert(ranges && ranges.length === 2);
        });
    });
});
