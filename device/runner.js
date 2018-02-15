var childProcess = require('child_process');
var path = require('path');
var fs = require('fs');

var runningProcess;

module.exports = {
    getProgramDirectory: function (version) {
        let programDir = __dirname + '/program';
        let versionDir = programDir + '/' + version;

        if (!fs.existsSync(programDir)) {
            fs.mkdirSync(programDir);
        }

        if (!fs.existsSync(versionDir)) {
            fs.mkdirSync(versionDir);
        }

        return versionDir;
    },

    startProgram: function (version, errorCallback) {
        let errorThrown = false;

        function handleError(error) {
            console.log('Program error:', error);
            errorThrown = true;
            errorCallback();
        }

        try {
            let processFile = this.getProgramDirectory(version) + '/index.js';

            runningProcess = childProcess.fork(processFile);
            console.log('Started program using v' + version);

            runningProcess.on('exit', (code) => {
                if (code && code !== 0) {
                    handleError('exited with error code: ' + code);
                }
            });

            runningProcess.on('error', handleError);
            runningProcess.on('uncaughtException', handleError);
        } catch (e) {
            handleError(e);
        }
    },

    stopProgram: function (callback) {
        let callbackCalled = false;

        function handleStop(code) {
            if (!callbackCalled) {
                console.log('Program stopped');
                callbackCalled = true;
                callback();
            }
        }

        if (runningProcess.exitCode) {
            handleStop();

            return;
        }

        try {
            runningProcess.kill();

            console.log('Stopping program');

            runningProcess.on('close', handleStop);
            runningProcess.on('close', handleStop);

            runningProcess.on('SIGINT', handleStop);
            runningProcess.on('SIGTERM', handleStop);
        } catch (e) {
            console.log('Failed to kill program:', e.message);

            callback();
        }
    }
};