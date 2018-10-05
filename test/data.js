const assert = require('assert');

const { AuthenticationClient, DataManagementClient } = require('..');

describe('DataManagementClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        const auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
        this.client = new DataManagementClient(auth);
    });

    describe('buckets()', function() {
        it('should return a list of buckets', async function() {
            for await (const buckets of this.client.buckets()) {
                assert(buckets.length > 0);
            }
        });
    });
});