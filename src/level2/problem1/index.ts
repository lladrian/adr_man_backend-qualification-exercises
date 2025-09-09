export class ExecutionCache<TInputs extends Array<unknown>, TOutput> {
  private cache = new Map<string, Promise<TOutput>>();

  constructor(private readonly handler: (...args: TInputs) => Promise<TOutput>) {}

  async fire(key: string, ...args: TInputs): Promise<TOutput> {
    if (!this.cache.has(key)) {
      const promise = this.handler(...args);
      this.cache.set(key, promise);
    }
    return this.cache.get(key)!;
  }
}
