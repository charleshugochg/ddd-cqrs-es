import { mkdirSync, watch } from 'fs'
import { access, readFile, writeFile } from 'fs/promises'
import { parse } from 'path'
import { writeFileAtomically } from './fileSystem.mjs'
import { AsyncQueue } from './AsyncQueue.mjs'

export class FilesystemMessageBus {
  #inboxDirectory
  #processedIdsDirectory
  #subscribersByTopic
  #processingQueue

  constructor({ storageDirectory, subscriberGroup = 'default' }) {
    this.#inboxDirectory = `${storageDirectory}/_inbox`
    this.#processedIdsDirectory = `${storageDirectory}/${subscriberGroup}`
    this.#subscribersByTopic = new Map()
    this.#processingQueue = new AsyncQueue()
    mkdirSync(this.#inboxDirectory, { recursive: true })
    mkdirSync(this.#processedIdsDirectory, { recursive: true })
    watch(this.#inboxDirectory, (_, filename) => {
      const { name: messageId, ext: extension } = parse(filename)
      if (extension === '.json') this.#processMessage(messageId)
    })
  }

  subscribe(topic, subscriber) {
    const newSubscribers = this.#getSubscribers(topic).concat([subscriber])
    this.#subscribersByTopic.set(topic, newSubscribers)
  }

  unsubscribe(topic, subscriber) {
    const subscribers = this.#getSubscribers(topic)
    subscribers.splice(subscribers.indexOf(subscriber), 1)
    this.#subscribersByTopic.set(topic, subscribers)
  }

  async publish(topic, message) {
    await writeFileAtomically(`${this.#inboxDirectory}/${message.id}.json`, JSON.stringify({ topic, message }))
  }

  #getSubscribers(topic) {
    return this.#subscribersByTopic.get(topic) || []
  }

  #processMessage(messageId) {
    this.#processingQueue.enqueueOperation(async () => {
      const isNewItem = await access(`${this.#processedIdsDirectory}/${messageId}`)
        .then(() => false)
        .catch(() => true)
      if (!isNewItem) return
      const { topic, message } = JSON.parse(await readFile(`${this.#inboxDirectory}/${messageId}.json`, 'utf-8'))
      await Promise.all(
        this.#getSubscribers(topic).map(
          (subscriber) => new Promise((resolve) => setTimeout(() => Promise.resolve(subscriber(message)).then(resolve)))
        )
      )
      await writeFile(`${this.#processedIdsDirectory}/${messageId}`, '')
    })
  }
}
