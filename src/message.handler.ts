import * as cluster from 'cluster';
import { Cache } from 'lru-cache';

import { Message, MessageParams, CHANNEL_NAME } from './message';
import { MessageManager } from './message.manager';

export class MessageHandler {
  constructor(
    private msgManager: MessageManager,
    private cache?: Cache<string>
  ) { }

  public onMessage(message: Message) {
    if (cluster.isMaster) {
      this.onMessageFromWorker(message);
    } else {
      this.onMessageFromMaster(message);
    }
  }

  private onMessageFromMaster(reply: Message) {
    if (!this.canHandle(reply)) {
      return;
    }

    let message = this.msgManager.get(reply.id);

    if (!message) {
      return;
    }

    message.subject.next(reply.params.value);

    process.nextTick(() => this.msgManager.dispose(message.id));
  }

  private onMessageFromWorker(message: Message) {

    if (!this.canHandle(message)) {
      return;
    }

    let replyParams = this.handle(message.type, message.params);

    let reply = new Message(message.id, 'reply', replyParams);

    reply.pid = message.pid;

    this.msgManager.reply(reply);
  }

  private canHandle(message: Message) {
    return message && message.channel === CHANNEL_NAME;
  }

  private handle(type: string, params: MessageParams): MessageParams {
    switch(type) {
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
  }
}
