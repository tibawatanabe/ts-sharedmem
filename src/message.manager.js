"use strict";
var message_1 = require("./message");
var message_dispatcher_1 = require("./message.dispatcher");
var MessageManager = (function () {
    function MessageManager() {
        this.messages = new Map();
        this.messagesCount = 0;
    }
    MessageManager.prototype.getMessage = function (id) {
        return this.messages[id];
    };
    MessageManager.prototype.replyMessage = function (message) {
        message_dispatcher_1.MessageDispatcher.sendToWorker(message);
    };
    MessageManager.prototype.sendMessage = function (method, params) {
        var message = new message_1.Message(this.messagesCount++, method, params);
        this.messages[message.id] = message;
        message_dispatcher_1.MessageDispatcher.sendToMaster(message);
        return message.subject;
    };
    MessageManager.prototype.disposeMessage = function (id) {
        this.messages[id].subject.dispose();
        this.messages["delete"](id);
    };
    return MessageManager;
}());
exports.MessageManager = MessageManager;
