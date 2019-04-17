const { AuthenticationClient } = require('./auth');
const { DataManagementClient } = require('./data');
const { ModelDerivativeClient } = require('./deriv');
const { BIM360Client } = require('./bim360');
const { DesignAutomationClient } = require('./design-automation');

module.exports = {
    AuthenticationClient,
    DataManagementClient,
    ModelDerivativeClient,
    BIM360Client,
    DesignAutomationClient
};
