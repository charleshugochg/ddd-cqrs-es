import { mkdirSync } from 'fs'
import { readFileWithFallback, writeFileAtomically } from '../fileSystem.mjs'
import { mkdir, readFile, writeFile } from 'fs/promises'

export class FileSystemEventStore {
  storageDirectory

  constructor({ storageDirectory }) {
    mkdirSync(storageDirectory, { recursive: true })
    Object.defineProperty(this, 'storageDirectory', { value: storageDirectory, writable: false })
  }

  async save(streamId, events) {
    const streamDirectory = `${this.storageDirectory}/${streamId}`
    await mkdir(streamDirectory, { recursive: true })
    const currentVersion = await this.#getStreamVersion(streamDirectory)
    await Promise.all(
      events.map((event, index) => {
        const numberedEvent = { ...event, number: currentVersion + index + 1 }
        return writeFileAtomically(`${streamDirectory}/${numberedEvent.number}.json`, JSON.stringify(numberedEvent))
      })
    )
    const newVersion = currentVersion + events.length
    await writeFile(`${streamDirectory}/_version`, `${newVersion}`)
  }

  async load(streamId, { startVersion: start = 1 } = {}) {
    const streamDirectory = `${this.storageDirectory}/${streamId}`
    const currentVersion = await this.#getStreamVersion(streamDirectory)
    const events = await Promise.all(
      Array.from({ length: currentVersion - start + 1 }, (_, index) =>
        readFile(`${streamDirectory}/${start + index}.json`).then(JSON.parse)
      )
    )
    return { events, currentVersion }
  }

  #getStreamVersion(streamDirectory) {
    return readFileWithFallback(`${streamDirectory}/_version`, '0').then(Number)
  }
}
