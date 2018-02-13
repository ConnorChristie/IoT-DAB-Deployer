var childProcess = require('child_process');

var runningProcess;

module.exports = {
    startProcess: function (programFile) {
        try {
            runningProcess = childProcess.fork(programFile);
        } catch (e) {
            console.log('Failed to start program:', e);
        }
    },

    stopProcess: function (callback) {
        try {
            runningProcess.kill();
        
            programProcess.on('close', function (code) {
                callback();
            });
        } catch (e) {
            console.log('Failed to kill program:', e);

            callback();
        }
    }
};