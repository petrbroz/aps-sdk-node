const assert = require('assert');

const { AuthenticationClient, DataManagementClient } = require('..');

describe('DataManagementClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_BUCKET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        assert(FORGE_BUCKET);
        const auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
        this.client = new DataManagementClient(auth);
        this.bucket = FORGE_BUCKET;
    });

    describe('buckets()', function() {
        it('should return a list of buckets', async function() {
            for await (const buckets of this.client.buckets()) {
                assert(buckets.length > 0);
            }
        });
    });

    describe('bucketDetails()', function() {
        it('should return bucket info', async function() {
            const details = await this.client.bucketDetails(this.bucket);
            assert(details);
            assert(details.bucketKey === this.bucket);
            assert(details.bucketOwner);
            assert(details.createdDate);
            assert(details.permissions);
            assert(details.policyKey);
        });
    });
});