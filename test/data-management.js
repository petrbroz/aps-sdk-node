const assert = require('assert');
const axios = require('axios');
const { Readable, Writable } = require('stream');

const { DataManagementClient } = require('..');

describe('DataManagementClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_BUCKET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        assert(FORGE_BUCKET);
        this.client = new DataManagementClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
        this.bucket = FORGE_BUCKET;
        this.timeout(10000); // Increase timeout to 10 seconds
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
            this.timeout(30000);
            const objects = await this.client.listObjects(this.bucket);
            assert(objects.length > 0);
        });
        it('should only list objects with given prefix', async function() {
            this.timeout(30000);
            const prefix = 'p';
            const objects = await this.client.listObjects(this.bucket, prefix);
            for (const obj of objects) {
                assert(obj.objectKey.startsWith(prefix));
            }
        });
    });

    describe('iterateObjects()', function() {
        it('should iterate over objects', async function() {
            this.timeout(30000);
            for await (const objects of this.client.iterateObjects(this.bucket)) {
                assert(objects.length > 0);
                break;
            }
        });
        it('should only iterate over objects with given prefix', async function() {
            this.timeout(30000);
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
            this.timeout(30000);
            const objectName = 'test-file';
            const buff = Buffer.from('This is a test string!', 'utf8');
            const result = await this.client.uploadObject(this.bucket, objectName, buff, { contentType: 'text/plain; charset=UTF-8' });
            assert(result);
            assert(result.location);
            assert(result.location.indexOf(objectName) !== -1);
        });
        it('should upload object stream', async function() {
            this.timeout(30000);
            const objectName = 'test-file-stream';
            const stream = new Readable({
                read() {
                    this.push(Buffer.from('This is a test string!', 'utf8'));
                    this.push(null);
                }
            });
            const result = await this.client.uploadObjectStream(this.bucket, objectName, stream, { contentType: 'text/plain; charset=UTF-8' });
            assert(result);
            assert(result.location);
            assert(result.location.indexOf(objectName) !== -1);
        });
    });

    // describe('downloadObject()', function() {
    //     it('should download object content', async function() {
    //         this.timeout(30000);
    //         const objectName = 'test-file';
    //         const content = await this.client.downloadObject(this.bucket, objectName);
    //         assert(content.indexOf('This is a test string!') === 0);
    //     });
    //     it('should download object stream', async function() {
    //         this.timeout(30000);
    //         const objectName = 'test-file-stream';
    //         const output = new Writable({
    //             write(chunk) {
    //                 if (!this.buff) {
    //                     this.buff = chunk;
    //                 } else {
    //                     this.buff = Buffer.concat(this.buff, chunk);
    //                 }
    //             }
    //         });
    //         const stream = await this.client.downloadObjectStream(this.bucket, objectName);
    //         stream.pipe(output);
    //         stream.on('end', () => {
    //             assert(output.buff.indexOf('This is a test string!') === 0);
    //         });
    //     });
    // });

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
        it('should upload object in multiple chunks', async function() {
            this.timeout(30000);
            const arr1 = new Uint8Array(5 << 20);
            for (let i = 0; i < arr1.length; i++) {
                arr1[i] = i % 255;
            }
            const arr2 = new Uint8Array(1 << 20);
            for (let i = 0; i < arr2.length; i++) {
                arr2[i] = i % 255;
            }
            const objectKey = 'forge-serve-utils-test-file-' + new Date().toISOString();
            const uploadParams = await this.client.getUploadUrls(this.bucket, objectKey, 2, 1);
            await axios.put(uploadParams.urls[0], arr1);
            await axios.put(uploadParams.urls[1], arr2);
            const obj = await this.client.completeUpload(this.bucket, objectKey, uploadParams.uploadKey);
            assert(obj.size, arr1.byteLength + arr2.byteLength);
        });
    });

    describe('copyObject()', function() {
        it('should copy object to another object with new name', async function () {
            const obj = await this.client.copyObject(this.bucket, 'buffer-upload-test.txt', 'buffer-upload-test-copy.txt');
            assert(obj.objectKey === 'buffer-upload-test-copy.txt');
        });
    });
});
