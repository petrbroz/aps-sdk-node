const { DataManagementClient } = require('./src/index');

const FORGE_CLIENT_ID = 'YhryNMLor4R1maFhY4zER8unpISoP5E4';
const FORGE_CLIENT_SECRET = 'CnXWkdA2znvVA1xN';
const FORGE_BUCKET = 'adsk-petrbroz-bucket';
const OBJECT_NAME = 'resumable-upload-test-v16';
const SESSION_ID = 'MyTestSession';

const data = new DataManagementClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });

async function run() {
    const arr = new Uint8Array(2428003);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 255);
    }
    let ranges = null;
    const buff = Buffer.from(arr);

    await data.uploadObjectResumable(FORGE_BUCKET, OBJECT_NAME, buff, 0, 10 << 20, SESSION_ID, 'text/plain');
    ranges = await data.getResumableUploadStatus(FORGE_BUCKET, OBJECT_NAME, SESSION_ID);
    console.log(ranges);
    // await data.uploadObjectResumable(FORGE_BUCKET, OBJECT_NAME, buff, 4 << 20, 10 << 20, SESSION_ID, 'text/plain');
    // ranges = await data.getResumableUploadStatus(FORGE_BUCKET, OBJECT_NAME, SESSION_ID);
    // console.log(ranges);
}

run();
