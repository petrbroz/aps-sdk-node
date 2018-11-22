const { AuthenticationClient } = require('..');

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;

(async function() {
    let client = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
    let auth = await client.authenticate(['viewables:read']);
    console.log(auth.access_token);
})();