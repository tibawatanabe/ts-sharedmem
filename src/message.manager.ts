import { Observable } from 'rxjs/Observable';

import { Message, MessageParams } from './message';
import { MessageDispatcher } from './message.dispatcher';


export class MessageManager {
  private messages: Map<number, Message> = new Map<number, Message>();
  private messagesCount: number = 0;

  public getMessage(id: number): Message {
    return this.messages[id];
  }

  public replyMessage(message: Message) {
    MessageDispatcher.sendToWorker(message);
  }

  public sendMessage(method: string, params?: MessageParams) : Observable<any> {
      let message = new Message(this.messagesCount++, method, params);

      this.messages[message.id] = message;
      MessageDispatcher.sendToMaster(message);

      return message.subject;
  }

  public disposeMessage(id: number) {
    this.messages[id].subject.unsubscribe();
    this.messages.delete(id);
  }
}
