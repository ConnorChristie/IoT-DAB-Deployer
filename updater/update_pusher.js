var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;

var connectionString = 'HostName=DAB-Hub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=l3mfQe03nobu0/Hmu7VnsdEOc6afufSmV0QOjiwLtZY=';
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);
var deviceToUpdate = 'dabOne';

var startFirmwareUpdateDevice = function () {
    var version = process.argv[2] || '1.2';
    
    var params = {
        version: version
    };

    var methodName = "firmwareUpdate";
    var payloadData = JSON.stringify(params);

    var methodParams = {
        methodName: methodName,
        payload: payloadData,
        timeoutInSeconds: 30
    };

    client.invokeDeviceMethod(deviceToUpdate, methodParams, function (err, result) {
        if (err) {
            console.error('Could not start the firmware update on the device: ' + err.message)
        }
    });
};

startFirmwareUpdateDevice();