// Test IoT hub instance
var connectionString = 'HostName=DAB-Hub.azure-devices.net;DeviceId=dabOne;SharedAccessKey=cnlDE9atnZX9ItOOORkpc4knvpzBJWi5L3843yS0mzQ=';

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var downloadRelease = require('download-github-release');
var fs = require('fs');

var versionJsonObject = {};

try {
    let rawdata = fs.readFileSync('versions.json');
    var versionJsonObject = JSON.parse(rawdata);
} catch (e) {}

var writeJsonVersions = function () {
    fs.writeFileSync('versions.json', JSON.stringify(versionJsonObject, null, 2));
}

var Runner = require('./runner');
var client = Client.fromConnectionString(connectionString, Protocol);

var reportFWUpdateThroughTwin = function (twin, firmwareUpdateValue) {
    var patch = {
        iothubDM: {
            firmwareUpdate: firmwareUpdateValue
        }
    };

    twin.properties.reported.update(patch, function (err) {
        if (err) throw err;
        console.log('Twin state reported: ' + firmwareUpdateValue.status);
    });
};

var downloadImage = function (twin, params, callback) {
    let now = new Date();

    versionJsonObject.lastGoodBuild = versionJsonObject.currentBuild;
    // Add current version to good version list 

    reportFWUpdateThroughTwin(twin, {
        status: 'downloading',
    });

    let username = params.gh.username;
    let project = params.gh.project;
    let version = params.version;

    console.log('params', params);

    let outputDir = Runner.getProgramDirectory(version);

    // Download to working directory
    downloadRelease(username, project, outputDir, (release) => release.tag_name === version, () => true, false)
        .then(function () {
            reportFWUpdateThroughTwin(twin, {
                status: 'downloadComplete',
                downloadCompleteTime: now.toISOString(),
            });

            callback();
        })
        .catch(function (err) {
            console.error('Error downloading image:', err.message);
        });

    versionJsonObject.currentBuild = version;
    writeJsonVersions();
}

var applyImage = function (twin, version, callback) {
    var now = new Date();

    reportFWUpdateThroughTwin(twin, {
        status: 'applying',
        startedApplyingImage: now.toISOString()
    });

    Runner.stopProgram(function () {
        Runner.startProgram(version, handleError);

        reportFWUpdateThroughTwin(twin, {
            status: 'applyComplete',
            lastFirmwareUpdate: now.toISOString()
        });

        callback();
    });
}

var handleError = function (error) {
    let version = versionJsonObject.lastGoodBuild;

    applyImage(twin, version, () => {
        versionJsonObject.currentBuild = version;
        writeJsonVersions();
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
            downloadImage(twin, payload, function (version) {
                applyImage(twin, version, function () { });
            });
        }
    });
}

if (versionJsonObject.currentBuild) {
    Runner.startProgram(versionJsonObject.currentBuild, handleError);
}

client.open(function (err) {
    if (err) {
        console.error('Could not connect to IotHub client', err);
    } else {
        console.log('Client connected to IoT Hub.  Waiting for firmwareUpdate direct method.');
    }

    client.onDeviceMethod('firmwareUpdate', onFirmwareUpdate);
});
