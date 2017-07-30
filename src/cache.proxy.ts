import * as LRU from 'lru-cache';

export class Cache {
  constructor(private cache: LRU.Cache<string>) { }

  public set(key: string, value: string, maxAge?: number) {
    this.cache.set(key, value, maxAge)
    return 'cached';
  }

  public get(key: string) {
    return this.cache.get(key);
  }

  public peek(key: string) {
    return this.cache.peek(key);
  }

  public del(key: string) {
    this.cache.del(key)
    return 'deleted';
  }
}
