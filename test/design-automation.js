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

    describe('engines()', function() {
        it('should return a list of engines', async function() {
            for await (const engines of this.client.engines()) {
                assert(engines.length > 0);
                break; // Skip additional pages
            }
        });
    });

    describe('appbundles()', function() {
        it('should return a list of appbundles', async function() {
            for await (const appbundles of this.client.appbundles()) {
                assert(appbundles.length > 0);
                break; // Skip additional pages
            }
        });
    });

    describe('createAppBundle()', function() {
        /* Don't want to create a new app bundle on every test run... */
        // it('should create a new bundle', async function() {
        //     const bundle = this.client.createAppBundle('ForgeNodejsUtilsTestBundle', 'This bundle is only used for testing.', 'Autodesk.Revit+2019')
        //     assert(bundle);
        // });

        it('should fail because a bundle with this name already exists', function(done) {
            this.client.createAppBundle('ForgeNodejsUtilsTestBundle', 'This bundle is only used for testing.', 'Autodesk.Revit+2019')
                .catch((err) => {
                    //console.log(err);
                    done();
                });
        });
    });

    describe('activities()', function() {
        it('should return a list of activities', async function() {
            for await (const activities of this.client.activities()) {
                assert(activities.length > 0);
                break; // Skip additional pages
            }
        });
    });
});
