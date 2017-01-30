import * as cluster from 'cluster';

import { SharedMem } from '../src/sharedmem';

if (cluster.isMaster) {

  SharedMem.initMaster({ max: 10, maxAge: 10000 });

  for (let i = 0; i < 4; ++i) {
    cluster.fork();
  }

} else {

  let shared = SharedMem.initWorker();

  for (let i = 0; i < 20; ++i) {
    let time = Math.floor((Math.random() * 10) + 1) * 100;

    setTimeout(() => {
      let random = Math.floor((Math.random() * 10) + 1);

      shared.get(`${random}`)
            .subscribe(response => {
              console.log(`#${random} got ${response}`);
            });

      shared.set(`${random}`, `${process.pid}`)
            .subscribe(response => {
              console.log(`#${random} were updated by ${process.pid}`);
            });

    }, time)
  }
}
