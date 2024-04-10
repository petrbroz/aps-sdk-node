const assert = require('assert');

const { ModelDerivativeClient } = require('..');

describe('ModelDerivativeClient', function() {
    beforeEach(function() {
        const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_MODEL_URN } = process.env;
        assert(APS_CLIENT_ID);
        assert(APS_CLIENT_SECRET);
        this.client = new ModelDerivativeClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
        this.urn = APS_MODEL_URN;
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