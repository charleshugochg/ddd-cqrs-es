export class InMemoryIndexedStorage {
  #recordsById = new Map()
  #indexes
  #indexMaps

  constructor({ indexes = [] }) {
    this.#indexes = indexes
    this.#indexMaps = Object.fromEntries(indexes.map((index) => [index, new Map()]))
  }

  update(id, updates) {
    const oldRecord = this.#recordsById.get(id) || {}
    const newRecord = { ...oldRecord, ...updates }
    this.#recordsById.set(id, newRecord)

    const indexesToUpdate = this.#indexes.filter((index) => index in updates)
    for (const index of indexesToUpdate) {
      if (index in oldRecord) {
        const oldIndexIds = this.#indexMaps[index].get(`${oldRecord[index]}`)
        const idIndex = oldIndexIds.indexOf(id)
        if (idIndex > -1) oldIndexIds.splice(idIndex, 1)
      }
      const newIndexIds = this.#indexMaps[index].get(`${newRecord[index]}`) || []
      this.#indexMaps[index].set(`${newRecord[index]}`, newIndexIds.concat(id))
    }
  }

  load(id) {
    return this.#recordsById.get(id)
  }

  findByIndex(index, indexValue) {
    const valueMap = this.#indexMaps[index]
    return (valueMap.get(indexValue) || []).map((id) => this.load(id))
  }

  #updateIndexes(updates) {}
}
