import { Observable } from 'rxjs/Observable';

import { Message, MessageParams } from './message';
import { MessageDispatcher } from './message.dispatcher';
import { SendStrategy } from './message-dispatch.strategies';


export class MessageManager {
  private messages      : Map<number, Message> = new Map<number, Message>();
  private messagesCount : number = 0;

  constructor(private dispatcher: SendStrategy) { }

  get(id: number): Message {
    return this.messages[id];
  }

  reply(message: Message) {
    this.dispatcher.send(message);
  }

  send(method: string, params?: MessageParams) : Observable<any> {
      let message = new Message(this.messagesCount++, method, params);

      this.messages[message.id] = message;
      this.dispatcher.send(message);

      return message.subject;
  }

  dispose(id: number) {
    this.messages[id].subject.unsubscribe();
    this.messages.delete(id);
  }
}
