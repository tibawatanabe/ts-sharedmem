"use strict";
var cluster = require("cluster");
var MessageDispatcher = (function () {
    function MessageDispatcher() {
    }
    MessageDispatcher.sendToMaster = function (message) {
        message.pid = process.pid;
        process.send(message);
    };
    MessageDispatcher.sendToWorker = function (message) {
        var worker = findWorker(message.pid);
        if (worker) {
            worker.send(message);
        }
    };
    return MessageDispatcher;
}());
exports.MessageDispatcher = MessageDispatcher;
function findWorker(pid) {
    var keys = Object.keys(cluster.workers);
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        if (cluster.workers[key].process.pid === pid) {
            return cluster.workers[key];
        }
    }
    return undefined;
}
