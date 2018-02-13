var childProcess = require('child_process');
var path = require('path');
var fs = require('fs');

var runningProcess;

module.exports = {
    getProgramDirectory: function () {
        let programDir = __dirname + '/program';

        if (!fs.existsSync(programDir)) {
            fs.mkdirSync(programDir);
        }

        return programDir;
    },

    startProgram: function (callback) {
        try {
            let processFile = this.getProgramDirectory() + '/index.js';

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