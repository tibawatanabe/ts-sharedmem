import { Observable } from 'rxjs/Observable';
import * as cluster from 'cluster';
import * as LRU from 'lru-cache';

import { MessageManager } from './message.manager';
import { MessageHandler } from './message.handler';

export class SharedMem {

  public static initMaster(lruOptions: LRU.Options<string>) {
    if (cluster.isWorker) {
      throw Error('SharedMem.initMaster cannot be called from worker process.');
    }

    let msgManager = new MessageManager();
    let lruCache   = LRU(lruOptions);
    let msgHandler = new MessageHandler(msgManager, lruCache);

    Object.keys(cluster.workers)
          .forEach((workerId) => cluster.workers[workerId].on('message', (message) => msgHandler.onMessageFromWorker(message)));

    // forks created after this setup
    cluster.on('fork', (worker) => worker.on('message', (message) => msgHandler.onMessageFromWorker(message)));
  }

  public static initWorker() : SharedMem {
    if (cluster.isMaster) {
      throw Error('SharedMem.initWorker cannot be called from master process.');
    }

    let msgManager = new MessageManager();
    let msgHandler = new MessageHandler(msgManager);

    process.on('message', (message) => msgHandler.onMessageFromMaster(message));

    return new SharedMem(msgManager);
  }

  constructor(
    private msgManager: MessageManager
  ) { }

  public set(key: string, value: string, maxAge?: number) : Observable<any> {
    return this.msgManager.sendMessage('set', { key, value, maxAge });
  }

  public get(key: string) : Observable<any> {
    return this.msgManager.sendMessage('get', { key });
  }

  public peek(key: string) : Observable<any> {
    return this.msgManager.sendMessage('peek', { key });
  }

  public del(key: string) : Observable<any> {
    return this.msgManager.sendMessage('del', { key });
  }
}
