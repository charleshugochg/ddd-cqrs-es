export class AsyncQueue {
  #currentQueuePromise = Promise.resolve()

  enqueueOperation(operation) {
    this.#currentQueuePromise = this.#currentQueuePromise.then(operation, operation)
    return this.#currentQueuePromise
  }
}
