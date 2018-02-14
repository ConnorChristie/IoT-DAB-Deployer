var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

var connectionString = process.env.AZURE_IOT_CONNECTION;
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);
var deviceToUpdate = 'dabOne';

var startFirmwareUpdateDevice = function () {
    let username = process.env.GITHUB_USER;
    let repo = process.env.GITHUB_REPO;
    let version = process.argv[2];

    let params = {
        gh: {
            username: username,
            project: repo
        },
        version: version
    };

    let methodParams = {
        methodName: 'firmwareUpdate',
        payload: JSON.stringify(params),
        timeoutInSeconds: 30
    };

    client.invokeDeviceMethod(deviceToUpdate, methodParams, function (err, result) {
        if (err) {
            console.error('Could not start the firmware update on the device: ' + err.message);

            process.exit(1);

            return;
        }

        console.log(`Successfully deployed ${username}/${repo} v${version} to ${deviceToUpdate}`);
    });
};

startFirmwareUpdateDevice();