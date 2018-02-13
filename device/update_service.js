var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var downloadRelease = require('download-github-release');

var Runner = require('./runner');

var connectionString = 'HostName=DAB-Hub.azure-devices.net;DeviceId=dabOne;SharedAccessKey=cnlDE9atnZX9ItOOORkpc4knvpzBJWi5L3843yS0mzQ=';
var client = Client.fromConnectionString(connectionString, Protocol);

var reportFWUpdateThroughTwin = function (twin, firmwareUpdateValue) {
    var patch = {
        iothubDM: {
            firmwareUpdate: firmwareUpdateValue
        }
    };

    twin.properties.reported.update(patch, function (err) {
        if (err) throw err;
        console.log('twin state reported: ' + firmwareUpdateValue.status);
    });
};

var downloadImage = function (twin, version, callback) {
    var now = new Date();

    reportFWUpdateThroughTwin(twin, {
        status: 'downloading',
    });

    var outputdir = '/Users/connor/Desktop/Architecture/DAB/program';

    downloadRelease('ConnorChristie', 'pinger', outputdir, (release) => release.tag_name === version, () => true, false)
        .then(function() {
            reportFWUpdateThroughTwin(twin, {
                status: 'downloadComplete',
                downloadCompleteTime: now.toISOString(),
            });

            callback(outputdir + '/index.js');
        })
        .catch(function(err) {
            console.error(err.message);
        });
}

var applyImage = function (twin, programFile, callback) {
    var now = new Date();

    reportFWUpdateThroughTwin(twin, {
        status: 'applying',
        startedApplyingImage: now.toISOString()
    });

    Runner.stopProcess(function() {
        Runner.startProcess(programFile);

        reportFWUpdateThroughTwin(twin, {
            status: 'applyComplete',
            lastFirmwareUpdate: now.toISOString()
        });
    
        callback();
    });
}

var onFirmwareUpdate = function (request, response) {

    // Respond the cloud app for the direct method
    response.send(200, 'FirmwareUpdate started', function (err) {
        if (err) {
            console.error('An error occured when sending a method response:\n', err);
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });

    var payload = JSON.parse(request.payload);

    // Obtain the device twin
    client.getTwin(function (err, twin) {
        if (err) {
            console.error('Could not get device twin.');
        } else {
            console.log('Device twin acquired.');

            // Start the multi-stage firmware update
            downloadImage(twin, payload.version, function (programFile) {
                applyImage(twin, programFile, function () { });
            });

        }
    });
}

Runner.startProcess('./program/index.js');

client.open(function (err) {
    if (err) {
        console.error('Could not connect to IotHub client', err);
    } else {
        console.log('Client connected to IoT Hub.  Waiting for firmwareUpdate direct method.');
    }

    client.onDeviceMethod('firmwareUpdate', onFirmwareUpdate);
});
