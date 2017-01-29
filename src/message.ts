import { Subject } from 'rxjs/Subject';

export const CHANNEL_NAME = 'sharedmem'

export class Message {
  channel : string = CHANNEL_NAME;
  pid     : number;
  subject : Subject<any> = new Subject<any>();

  constructor(
    public id     : number,
    public type   : string,
    public params : MessageParams
  ) { }
}

export interface MessageParams {
  key     : string;
  value?  : string;
  maxAge? : number;
}
