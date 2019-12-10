const assert = require('assert');
const { BIM360Client } = require('..');
const { FORGE_3LEGGED_ACCESS_TOKEN, FORGE_HUB_ID, FORGE_PROJECT_ID } = process.env;

// Due to the 3-legged token requirement, this test is NOT included in the CI/CD pipeline
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
                assert(projects);
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
