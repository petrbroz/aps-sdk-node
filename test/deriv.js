const assert = require('assert');

const { AuthenticationClient, ModelDerivativeClient } = require('..');

describe('ModelDerivativeClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        const auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
        this.client = new ModelDerivativeClient(auth);
        this.urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6cGV0cmJyb3otZGF0YXNhbXBsZXMvYmFzaWMucnZ0';
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
});