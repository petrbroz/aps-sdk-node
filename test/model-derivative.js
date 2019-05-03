const assert = require('assert');

const { ModelDerivativeClient } = require('..');

describe('ModelDerivativeClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, FORGE_MODEL_URN } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        this.client = new ModelDerivativeClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
        this.urn = FORGE_MODEL_URN;
    });

    describe('formats()', function() {
        it('should return a list of formats', async function() {
            const formats = await this.client.formats();
            assert(formats);
        });
    });

    describe('submitJob()', function() {
        it('should return a job info', async function() {
            const job = await this.client.submitJob(this.urn, [{ type: 'svf', views: ['2d', '3d'] }]);
            assert(job);
            assert(job.result);
        });
    });

    describe('getManifest()', function() {
        it('should return derivative manifest', async function() {
            const manifest = await this.client.getManifest(this.urn);
            assert(manifest);
        });
    });

    describe('getMetadata()', function() {
        it('should return derivative metadata', async function() {
            const metadata = await this.client.getMetadata(this.urn);
            assert(metadata);
        });
    });
});