const assert = require('assert');

const { AuthenticationClient, DesignAutomationClient } = require('..');

describe('DesignAutomationClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        const auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
        this.client = new DesignAutomationClient(auth);
        this.timeout(5000); // Increase timeout to 5 seconds
    });

    describe('appbundles()', function() {
        it('should return a list of appbundles', async function() {
            for await (const appbundles of this.client.appbundles()) {
                assert(appbundles.length > 0);
                break; // Skip additional pages
            }
        });
    });
});
