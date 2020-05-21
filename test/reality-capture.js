const assert = require('assert');

const { OutputFormat, RealityCaptureClient, SceneType } = require('..');

describe('RealityCaptureClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, SCENE_ID } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        assert(SCENE_ID);
        this.client = new RealityCaptureClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET});
        this.sceneid = SCENE_ID;
    });

    describe('createPhotoScene()', function() {
        before(function() {
            const { SCENE_NAME, SCENE_CALLBACK } = process.env;
            assert(SCENE_NAME);
            assert(SCENE_CALLBACK);
            this.scenename = SCENE_NAME;
            this.scenecallback = SCENE_CALLBACK;
        });
        it('should create a new photoscene', async function() {
            /* const options = {
                scenename: this.scenename,
                scenetype: SceneType.Object,
                format: OutputFormat.RecapPhotoMesh,
                callback: this.callback
            };
            const photoscene = await this.client.createPhotoScene(options);
            assert(photoscene); */
        });
    });

    describe('addImages()', function() {
        it('should add images to the photoscene', async function() {
            /* const images = await this.client.addImages(this.sceneid, this.sceneformat, []);
            assert(images); */
        });
    });

    describe('processPhotoScene()', function() {
        it('should start photoscene processing', async function() {
            /* const job = await this.client.processPhotoScene(this.sceneid);
            assert(job); */
        });
    });

    describe('getPhotoSceneProgress()', function() {
        it('should return processing progress', async function() {
            /* const progress = await this.client.getPhotoSceneProgress(this.sceneid);
            assert(progress); */
        });
    });

    describe('getPhotoScene()', function() {
        it('should return time-limited HTTPS link to an output file', async function() {
           /*  const photoscene = await this.client.getPhotoScene(this.sceneid, 'rcm');
            assert(photoscene); */
        });
    });

    describe('cancelPhotoScene', function() {
        it('should abort the processing of a photoscene', async function() {
            /* const photoscene = await this.client.cancelPhotoScene(this.sceneid);
            assert(photoscene); */
        });
    });

    describe('deletePhotoScene', function() {
        it('should delete a photoscene and its associated assets', async function() {
            /* const photoscene = await this.client.deletePhotoScene(this.sceneid);
            assert(photoscene); */
        });
    });
});
