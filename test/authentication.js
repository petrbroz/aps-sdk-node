const assert = require('assert');

const { AuthenticationClient } = require('..');

describe('AuthenticationClient', function() {
    beforeEach(function() {
        const { APS_CLIENT_ID, APS_CLIENT_SECRET } = process.env;
        assert(APS_CLIENT_ID);
        assert(APS_CLIENT_SECRET);
        this.client = new AuthenticationClient(APS_CLIENT_ID, APS_CLIENT_SECRET);
    });

    describe('authenticate()', function() {
        it('should return a token for valid scopes', async function() {
            const authentication = await this.client.authenticate(['viewables:read']);
            assert(authentication.access_token);
            assert(authentication.expires_in > 0);
        });

        it('should reject promise for invalid scopes', function(done) {
            this.client.authenticate(['bad:scope'])
                .catch((err) => { done(); });
        });
    });
});