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

    startProgram: function (version, callback) {
        try {
            let processFile = this.getProgramDirectory(version) + '/index.js';

            runningProcess = childProcess.fork(processFile);

            runningProcess.on('error', (e) => { 
                console.log('Program error:', e); 
                callback(e); 
            });
            runningProcess.on('uncaughtException', (e) => { 
                console.log('Program exception:', e);
                callback(e);  
            });
        } catch (e) {
            console.log('Failed to start program:', e);
                callback(e);  
        }
    },

    stopProgram: function (callback) {
        try {
            runningProcess.kill();

            runningProcess.on('close', function (code) {
                callback();
            });
        } catch (e) {
            console.log('Failed to kill program:', e);

            callback();
        }
    }
};