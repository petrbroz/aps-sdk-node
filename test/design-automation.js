const assert = require('assert');

const { DesignAutomationClient } = require('..');

describe('DesignAutomationClient', function() {
    beforeEach(function() {
        const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
        assert(APS_CLIENT_ID);
        assert(APS_CLIENT_SECRET);
        this.client = new DesignAutomationClient({ client_id: APS_CLIENT_ID, client_secret: APS_CLIENT_SECRET });
        this.timeout(10000); // Increase timeout to 10 seconds
    });

    describe('listEngines()', function() {
        it('should return a list of engines', async function() {
            const engines = await this.client.listEngines();
            assert(engines.length > 0);
        });
    });

    describe('iterateEngines()', function() {
        it('should iterate over engines', async function() {
            for await (const engines of this.client.iterateEngines(this.bucket)) {
                assert(engines.length > 0);
                break;
            }
        });
    });

    describe('listAppBundles()', function() {
        it('should return a list of appbundles', async function() {
            const appBundles = await this.client.listAppBundles();
            assert(appBundles.length > 0);
        });
    });

    describe('iterateAppBundles()', function() {
        it('should iterate over app bundles', async function() {
            for await (const bundles of this.client.iterateAppBundles()) {
                assert(bundles.length > 0);
                break;
            }
        });
    });

    describe('createAppBundle()', function() {
        it('should fail because a bundle with this name already exists', function(done) {
            this.client.createAppBundle('TestBundle', 'Autodesk.Revit+2019')
                .catch((err) => {
                    //console.log(err);
                    done();
                });
        });
    });

    describe('listActivities()', function() {
        it('should return a list of activities', async function() {
            const activities = await this.client.listActivities();
            assert(activities.length > 0);
        });
    });

    describe('iterateActivities()', function() {
        it('should iterate over activities', async function() {
            for await (const activities of this.client.iterateActivities()) {
                assert(activities.length > 0);
                break;
            }
        });
    });
});
