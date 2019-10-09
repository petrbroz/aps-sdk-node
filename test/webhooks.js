const assert = require('assert');

const { WebhooksClient, WebhookSystem, WebhookEvent } = require('../dist');

describe('WebhooksClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        this.client = new WebhooksClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
        this.timeout(10000); // Increase timeout to 10 seconds
    });

    describe('listHooks()', function() {
        it('should return a list of all webhooks', async function() {
            const hooks = await this.client.listHooks();
            assert(hooks);
        });
        it('should return a list of webhooks of specific system', async function() {
            const hooks = await this.client.listHooks('data');
            assert(hooks);
        });
    });

    describe('iterateHooks()', function() {
        it('should iterate over all webhooks', async function() {
            for await (const hooks of this.client.iterateHooks()) {
                assert(hooks);
                break;
            }
        });
        it('should iterate over webhooks of specific system', async function() {
            for await (const hooks of this.client.iterateHooks('data')) {
                assert(hooks);
                break;
            }
        });
    });

    // describe('createHook()', function() {
    //     it('should create new webhook', async function() {
    //         const hooks = await this.client.createHook(WebhookSystem.Derivative, undefined, 'http://bf067e05.ngrok.io/callback', { workflow: 'my-workflow-id' });
    //         assert(hooks);
    //     });
    // });
});
