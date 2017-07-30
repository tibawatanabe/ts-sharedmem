import { Observable } from 'rxjs/Observable';
import * as cluster from 'cluster';
import * as LRU from 'lru-cache';

import { MessageManager } from './message.manager';
import { MessageHandler } from './message.handler';

import { SendToMasterStrategy, SendToWorkerStrategy } from './message-dispatch.strategies';

export class SharedMem {

  public static init(lruOptions?: LRU.Options<string>): SharedMem {
    if (cluster.isMaster) {
      if (!lruOptions) {
        throw Error('SharedMem.init at master process needs LRU.Options.');
      }
      return SharedMem.initMaster(lruOptions);
    } else {
      return SharedMem.initWorker();
    }
  }

  private static initMaster(lruOptions: LRU.Options<string>) {
    let msgManager = new MessageManager(new SendToWorkerStrategy);
    let lruCache   = LRU(lruOptions);
    let msgHandler = new MessageHandler(msgManager, lruCache);

    Object.keys(cluster.workers)
          .forEach((workerId) => cluster.workers[workerId].on('message', (message) => msgHandler.onMessage(message)));

    // forks created after this setup
    cluster.on('fork', (worker) => worker.on('message', (message) => msgHandler.onMessage(message)));

    return new SharedMem(msgManager);
  }

  private static initWorker() : SharedMem {
    let msgManager = new MessageManager(new SendToMasterStrategy);
    let msgHandler = new MessageHandler(msgManager);

    process.on('message', (message) => msgHandler.onMessage(message));

    return new SharedMem(msgManager);
  }

  private constructor(private msgManager: MessageManager) { }

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
