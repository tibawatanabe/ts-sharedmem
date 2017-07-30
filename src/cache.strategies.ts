import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { Cache } from 'cache.proxy';

import { MessageManager } from './message.manager';

export interface CacheStrategy {
  set(key: string, value: string, maxAge?: number) : Observable<any>;
  get(key: string) : Observable<any>;
  peek(key: string) : Observable<any>;
  del(key: string) : Observable<any>;
}

export class WorkerCacheStrategy {
  constructor(private msgManager: MessageManager) { }
  public set(key: string, value: string, maxAge?: number) : Observable<any> {
    return this.msgManager.send('set', { key, value, maxAge });
  }

  public get(key: string) : Observable<any> {
    return this.msgManager.send('get', { key });
  }

  public peek(key: string) : Observable<any> {
    return this.msgManager.send('peek', { key });
  }

  public del(key: string) : Observable<any> {
    return this.msgManager.send('del', { key });
  }
}

export class MasterCacheStrategy {
  constructor(private cache: Cache) {}

  public set(key: string, value: string, maxAge?: number) : Observable<any> {
    return Observable.of(this.cache.set(key, value, maxAge));
  }

  public get(key: string) : Observable<any> {
    return Observable.of(this.cache.get(key));
  }

  public peek(key: string) : Observable<any> {
    return Observable.of(this.cache.peek(key));
  }

  public del(key: string) : Observable<any> {
    return Observable.of(this.cache.del(key));
  }
}
