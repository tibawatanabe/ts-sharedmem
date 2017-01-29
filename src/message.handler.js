"use strict";
var message_1 = require("./message");
var MessageHandler = (function () {
    function MessageHandler(msgManager, cache) {
        this.msgManager = msgManager;
        this.cache = cache;
    }
    MessageHandler.prototype.onMessageFromMaster = function (reply) {
        var _this = this;
        if (!this.canHandle(reply)) {
            return;
        }
        var message = this.msgManager.getMessage(reply.id);
        if (!message) {
            return;
        }
        message.subject.next(reply.params.value);
        process.nextTick(function () { return _this.msgManager.disposeMessage(message.id); });
    };
    MessageHandler.prototype.onMessageFromWorker = function (message) {
        if (!this.canHandle(message)) {
            return;
        }
        var replyParams = this.handle(message.type, message.params);
        var reply = new message_1.Message(message.id, 'reply', replyParams);
        this.msgManager.replyMessage(reply);
    };
    MessageHandler.prototype.canHandle = function (message) {
        return message && message.channel === message_1.CHANNEL_NAME;
    };
    MessageHandler.prototype.handle = function (type, params) {
        switch (type) {
            case 'set':
                this.cache.set(params.key, params.value, params.maxAge);
                return { key: params.key, value: 'cached' };
            case 'get':
                return { key: params.key, value: this.cache.get(params.key) };
            case 'peek':
                return { key: params.key, value: this.cache.peek(params.key) };
            case 'del':
                this.cache.del(params.key);
                return { key: params.key, value: 'deleted' };
            default:
                return { key: params.key, value: 'unknown operation' };
        }
    };
    return MessageHandler;
}());
exports.MessageHandler = MessageHandler;
