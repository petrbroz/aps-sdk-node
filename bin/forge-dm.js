#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const program = require('commander');
const { prompt } = require('inquirer');

const { AuthenticationClient } = require('../src/auth');
const { DataManagementClient } = require('../src/data');

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
if (!FORGE_CLIENT_ID || !FORGE_CLIENT_SECRET) {
    console.warn('Provide FORGE_CLIENT_ID and FORGE_CLIENT_SECRET as env. variables.');
    return;
}
const auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
const data = new DataManagementClient(auth);

async function collectAsyncResults(iterator) {
    let results = [];
    for await (const page of iterator) {
        results = results.concat(page);
    }
    return results;
}

program
    .version('0.2.0')
    .description('Command-line tool for accessing Autodesk Forge Data Management service.');

program
    .command('list-buckets')
    .alias('lb')
    .description('List buckets.')
    .option('-s, --short', 'Output bucket keys instead of the entire JSON.')
    .action(async function(command) {
        if (command.short) {
            for await (const buckets of data.buckets()) {
                buckets.forEach(bucket => console.log(bucket.bucketKey));
            }
        } else {
            console.log(await collectAsyncResults(data.buckets()));
        }
    });

program
    .command('bucket-details [bucket]')
    .alias('bd')
    .description('Retrieve bucket details.')
    .action(async function(bucket) {
        if (!bucket) {
            const buckets = await collectAsyncResults(data.buckets());
            const answer = await prompt({ type: 'list', name: 'bucket', choices: buckets.map(bucket => bucket.bucketKey) });
            bucket = answer.bucket;
        }

        const details = await data.bucketDetails(bucket);
        console.log(details);
    });

program
    .command('list-objects [bucket]')
    .alias('lo')
    .description('List objects in bucket.')
    .option('-s, --short', 'Output object IDs instead of the entire JSON.')
    .action(async function(bucket, command) {
        if (!bucket) {
            const buckets = await collectAsyncResults(data.buckets());
            const answer = await prompt({ type: 'list', name: 'bucket', choices: buckets.map(bucket => bucket.bucketKey) });
            bucket = answer.bucket;
        }

        if (command.short) {
            for await (const objects of data.objects(bucket)) {
                objects.forEach(object => console.log(object.objectId));
            }
        } else {
            console.log(await collectAsyncResults(data.objects(bucket)));
        }
    });

program
    .command('upload-object <filename> <content-type> [bucket] [name]')
    .alias('uo')
    .description('Upload file to bucket.')
    .option('-s, --short', 'Output object ID instead of the entire JSON.')
    .action(async function(filename, contentType, bucket, name, command) {
        if (!bucket) {
            const buckets = await collectAsyncResults(data.buckets());
            const answer = await prompt({ type: 'list', name: 'bucket', choices: buckets.map(bucket => bucket.bucketKey) });
            bucket = answer.bucket;
        }

        if (!name) {
            const answer = await prompt({ type: 'input', name: 'name', default: path.basename(filename) });
            name = answer.name;
        }

        const buffer = fs.readFileSync(filename);
        // TODO: add support for passing in a readable stream instead of reading entire file into memory
        const uploaded = await data.uploadObject(bucket, name, contentType,  buffer);
        console.log(command.short ? uploaded.objectId : uploaded);
    });

program.parse(process.argv);
