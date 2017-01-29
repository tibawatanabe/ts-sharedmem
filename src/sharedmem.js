"use strict";
var cluster = require("cluster");
var LRU = require("lru-cache");
var message_manager_1 = require("./message.manager");
var message_handler_1 = require("./message.handler");
var SharedMem = (function () {
    function SharedMem(msgManager) {
        this.msgManager = msgManager;
    }
    SharedMem.initMaster = function (lruOptions) {
        if (cluster.isWorker) {
            throw Error('SharedMem.initMaster cannot be called from worker process.');
        }
        var msgManager = new message_manager_1.MessageManager();
        var lruCache = LRU(lruOptions);
        var msgHandler = new message_handler_1.MessageHandler(msgManager, lruCache);
        Object.keys(cluster.workers)
            .forEach(function (workerId) { return cluster.workers[workerId].on('message', function (message) { return msgHandler.onMessageFromWorker(message); }); });
        // forks created after this setup
        cluster.on('fork', function (worker) { return worker.on('message', function (message) { return msgHandler.onMessageFromWorker(message); }); });
    };
    SharedMem.initWorker = function () {
        if (cluster.isMaster) {
            throw Error('SharedMem.initWorker cannot be called from master process.');
        }
        var msgManager = new message_manager_1.MessageManager();
        var msgHandler = new message_handler_1.MessageHandler(msgManager);
        process.on('message', function (message) { return msgHandler.onMessageFromMaster(message); });
        return new SharedMem(msgManager);
    };
    SharedMem.prototype.set = function (key, value, maxAge) {
        return this.msgManager.sendMessage('set', { key: key, value: value, maxAge: maxAge });
    };
    SharedMem.prototype.get = function (key) {
        return this.msgManager.sendMessage('get', { key: key });
    };
    SharedMem.prototype.peek = function (key) {
        return this.msgManager.sendMessage('peek', { key: key });
    };
    SharedMem.prototype.del = function (key) {
        return this.msgManager.sendMessage('del', { key: key });
    };
    return SharedMem;
}());
exports.SharedMem = SharedMem;
