"use strict";
var Subject_1 = require("rxjs/Subject");
exports.CHANNEL_NAME = 'sharedmem';
var Message = (function () {
    function Message(id, type, params) {
        this.id = id;
        this.type = type;
        this.params = params;
        this.channel = exports.CHANNEL_NAME;
        this.subject = new Subject_1.Subject();
    }
    return Message;
}());
exports.Message = Message;
