import * as cluster from 'cluster';

import { Message, MessageParams } from './message';

export interface SendStrategy {
  send(message: Message);
}

export class SendToMasterStrategy implements SendStrategy {
  send(message: Message) {
    message.pid = process.pid;
    process.send(message);
  }
}

export class SendToWorkerStrategy implements SendStrategy {
  send(message: Message) {
    let worker = this.findWorker(message.pid);

    if (worker) {
      worker.send(message);
    }
  }

  private findWorker(pid: number) : cluster.Worker {
    let keys = Object.keys(cluster.workers);

    for (let key of keys) {
      if (cluster.workers[key].process.pid === pid) {
        return cluster.workers[key];
      }
    }

    return undefined;
  }
}
