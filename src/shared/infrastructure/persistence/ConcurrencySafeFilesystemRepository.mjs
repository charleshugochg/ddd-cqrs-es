import { readFile, readdir, rename, writeFile } from 'fs/promises'
import fs, { mkdirSync } from 'fs'
import { generateId } from '../id.mjs'
import { AsyncQueue } from '../AsyncQueue.mjs'

const writeFileAtomically = async (filePath, content) => {
  const tempPath = `${filePath}-${generateId()}.tmp`
  await writeFile(tempPath, content)
  await rename(tempPath, filePath)
}

class ConcurrencyConflictError extends Error {
  constructor({ entityToSave, latestEntity }) {
    super('ConcurrencyConflict')
    Object.assign(this, { entityToSave, latestEntity })
  }
}

export class ConcurrencySafeFilesystemRepository {
  storageDirectory
  #convertToData
  #convertToEntity
  #savedQueueById = new Map()

  constructor({ storageDirectory, convertToData, convertToEntity }) {
    mkdirSync(storageDirectory, { recursive: true })
    Object.defineProperty(this, 'storageDirectory', { value: storageDirectory, writable: false })
    this.#convertToData = convertToData
    this.#convertToEntity = convertToEntity
  }

  async save(entity) {
    if (!this.#savedQueueById.has(entity.id)) this.#savedQueueById.set(entity.id, new AsyncQueue())
    return await this.#savedQueueById.get(entity.id).enqueueOperation(async () => {
      await this.#verifyVersion(entity)
      const data = { ...this.#convertToData(entity), newDomainEvents: undefined }
      const savedEvents = await this.loadDomainEvents(entity.id)
      const allEvents = savedEvents.concat(entity.newDomainEvents)
      const fullData = { ...data, domainEvents: allEvents, version: (entity.baseVersion || 0) + 1 }
      await writeFileAtomically(this.getFilePath(entity.id), JSON.stringify(fullData))
    })
  }

  async load(id) {
    const data = await readFile(this.getFilePath(id), 'utf-8').then(JSON.parse)
    return Object.assign(this.#convertToEntity(data), { baseVersion: data.version })
  }

  async loadDomainEvents(id) {
    return await readFile(this.getFilePath(id), 'utf-8')
      .then(JSON.parse)
      .then((data) => data.domainEvents || [])
      .catch(() => [])
  }

  async loadAll() {
    const files = await readdir(this.storageDirectory)
    const jsonFiles = files.filter((filename) => filename.endsWith('.json'))
    const ids = jsonFiles.map((filename) => filename.replace('.json', ''))
    return Promise.all(ids.map((id) => this.load(id)))
  }

  getFilePath(id) {
    if (!id) throw new Error('invalid identifier')
    return `${this.storageDirectory}/${id}.json`
  }

  subscribeToEntityChanges(subscriber) {
    fs.watch(this.storageDirectory, (_, filename) => {
      if (filename.endsWith('.json')) subscriber(filename.replace('.json', ''))
    })
  }

  async #verifyVersion(entityToSave) {
    const latestEntity = await this.load(entityToSave.id).catch(() => ({}))
    if ((entityToSave.baseVersion || 0) !== (latestEntity.baseVersion || 0))
      throw new ConcurrencyConflictError({ entityToSave, latestEntity })
  }
}
