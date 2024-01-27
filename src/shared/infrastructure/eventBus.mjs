class MessageBus {
  #subscribersByTopic = new Map()
  subscribe(topic, subscriber) {
    const newSubscribers = this.#getSubscribers(topic).concat([subscriber])
    this.#subscribersByTopic.set(topic, newSubscribers)
  }
  unsubscribe(topic, subscriber) {
    const subscribers = this.#getSubscribers(topic).slice()
    subscribers.splice(subscribers.indexOf(subscriber), 1)
    this.#subscribersByTopic.set(topic, subscribers)
  }
  async publish(topic, message) {
    await Promise.all(
      this.#getSubscribers(topic).map(
        (subscriber) =>
          new Promise((resolve) => {
            setTimeout(() => {
              Promise.resolve(subscriber(message)).then(resolve)
            }, 0)
          })
      )
    )
  }
  #getSubscribers(topic) {
    return this.#subscribersByTopic.get(topic) || []
  }
}

export class EventBus {
  #messageBus
  constructor(messageBus = new MessageBus()) {
    this.#messageBus = messageBus
  }
  subscribe(eventType, subscriber) {
    return this.#messageBus.subscribe(eventType, subscriber)
  }
  unsubscribe(eventType, subscriber) {
    return this.#messageBus.unsubscribe(eventType, subscriber)
  }
  publish(event) {
    if (typeof event.type != 'string') throw new Error('invalid event')
    return this.#messageBus.publish(event.type, event)
  }
}
