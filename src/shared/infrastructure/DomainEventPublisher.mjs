import { readFile, writeFile } from 'fs/promises'
import { AsyncQueue } from './AsyncQueue.mjs'
import { mkdirSync } from 'fs'

export class DomainEventPublisher {
  #repository
  #eventBus
  #publishedEventIdsDirectory
  #publishingQueue

  constructor({ repository, eventBus, publishedEventIdsDirectory }) {
    this.#repository = repository
    this.#eventBus = eventBus
    this.#publishingQueue = new AsyncQueue()
    this.#publishedEventIdsDirectory = publishedEventIdsDirectory
    mkdirSync(publishedEventIdsDirectory, { recursive: true })
  }

  activate() {
    this.#repository.subscribeToEntityChanges((id) => this.publishDueDomainEvents(id))
  }

  publishDueDomainEvents(entityId) {
    this.#publishingQueue.enqueueOperation(async () => {
      const allEvents = await this.#repository.loadDomainEvents(entityId)
      const lastPublishedEventId = await this.#getLastPublishedEventId(entityId)
      const eventsToPublish = allEvents.slice(allEvents.findIndex((event) => event.id === lastPublishedEventId) + 1)
      await Promise.all(eventsToPublish.map((event) => this.#eventBus.publish(event)))
      await this.#saveLastPublishedEventId(entityId, eventsToPublish)
    })
  }

  async #getLastPublishedEventId(entityId) {
    const filePath = `${this.#publishedEventIdsDirectory}/${entityId}`
    return await readFile(filePath, 'utf-8').catch(() => '')
  }

  async #saveLastPublishedEventId(entityId, publishedEvents) {
    if (publishedEvents.length === 0) return true
    const filePath = `${this.#publishedEventIdsDirectory}/${entityId}`
    await writeFile(filePath, publishedEvents[publishedEvents.length - 1].id)
  }
}
