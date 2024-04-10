const assert = require('assert');
const { BIM360Client } = require('..');
const { APS_3LEGGED_ACCESS_TOKEN, APS_HUB_ID, APS_PROJECT_ID } = process.env;

/*

Due to the 3-legged token requirement, this test is NOT included in the CI/CD pipeline.
In order to run this test manually, run it from command line with the env. variables
listed at the top of this file.

For example:

```
export APS_3LEGGED_ACCESS_TOKEN=<your 3-legged token>
export APS_HUB_ID=<your hub ID>
export APS_PROJECT_ID=<your project ID>
npx mocha test/bim360.js
```

*/

if (APS_3LEGGED_ACCESS_TOKEN && APS_HUB_ID && APS_PROJECT_ID) {
    describe('BIM360Client', function() {
        beforeEach(function() {
            this.client = new BIM360Client({ token: APS_3LEGGED_ACCESS_TOKEN });
        });

        describe('listHubs()', function() {
            it('should return a list of hubs', async function() {
                const hubs = await this.client.listHubs();
                assert(hubs.length > 0);
            });
        });

        describe('getHubDetails()', function() {
            it('should return hub details', async function() {
                const details = await this.client.getHubDetails(APS_HUB_ID);
                assert(details);
            });
        });

        describe('listProjects()', function() {
            it('should return a list of projects', async function() {
                const projects = await this.client.listProjects(APS_HUB_ID);
                assert(projects.length > 0);
            });
        });

        describe('getProjectDetails()', function() {
            it('should return a list of projects', async function() {
                const details = await this.client.getProjectDetails(APS_HUB_ID, APS_PROJECT_ID);
                assert(details);
            });
        });
    });
}
