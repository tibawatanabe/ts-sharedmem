import * as cluster from 'cluster';

import { Message, MessageParams } from './message';

export class MessageDispatcher {

  public static sendToMaster(message: Message) {
    message.pid = process.pid;
    process.send(message);
  }

  public static sendToWorker(message: Message) {
    let worker = findWorker(message.pid);

    if (worker) {
      worker.send(message);
    }
  }
}

function findWorker(pid: number) : cluster.Worker {
  let keys = Object.keys(cluster.workers);

  for (let key of keys) {
    if (cluster.workers[key].process.pid === pid) {
      return cluster.workers[key];
    }
  }

  return undefined;
}
