var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

var connectionString = 'HostName=DAB-Hub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=l3mfQe03nobu0/Hmu7VnsdEOc6afufSmV0QOjiwLtZY=';
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);
var deviceToUpdate = 'dabOne';

var startFirmwareUpdateDevice = function () {
    let version = process.argv[2] || '1.2';

    let params = {
        gh: {
            username: 'ConnorChristie',
            project: 'pinger'
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
            console.log(err);
            console.error('Could not start the firmware update on the device: ' + err.message)
        }
    });
};

startFirmwareUpdateDevice();