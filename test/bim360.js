const assert = require('assert');
const { BIM360Client } = require('..');
const { FORGE_3LEGGED_ACCESS_TOKEN, FORGE_HUB_ID, FORGE_PROJECT_ID } = process.env;

/*

Due to the 3-legged token requirement, this test is NOT included in the CI/CD pipeline.
In order to run this test manually, run it from command line with the env. variables
listed at the top of this file.

For example:

```
export FORGE_3LEGGED_ACCESS_TOKEN=<your 3-legged token>
export FORGE_HUB_ID=<your hub ID>
export FORGE_PROJECT_ID=<your project ID>
npx mocha test/bim360.js
```

*/

if (FORGE_3LEGGED_ACCESS_TOKEN && FORGE_HUB_ID && FORGE_PROJECT_ID) {
    describe('BIM360Client', function() {
        beforeEach(function() {
            this.client = new BIM360Client({ token: FORGE_3LEGGED_ACCESS_TOKEN });
        });

        describe('listHubs()', function() {
            it('should return a list of hubs', async function() {
                const hubs = await this.client.listHubs();
                assert(hubs.length > 0);
            });
        });

        describe('getHubDetails()', function() {
            it('should return hub details', async function() {
                const details = await this.client.getHubDetails(FORGE_HUB_ID);
                assert(details);
            });
        });

        describe('listProjects()', function() {
            it('should return a list of projects', async function() {
                const projects = await this.client.listProjects(FORGE_HUB_ID);
                assert(projects.length > 0);
            });
        });

        describe('getProjectDetails()', function() {
            it('should return a list of projects', async function() {
                const details = await this.client.getProjectDetails(FORGE_HUB_ID, FORGE_PROJECT_ID);
                assert(details);
            });
        });
    });
}
