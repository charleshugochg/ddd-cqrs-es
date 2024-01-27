let generateId = () => ''
let createMetadata = () => ({})

export const createEventType = (type, dataStructure) => {
  const Event = function (data) {
    const containsInvalidFields = Object.keys(dataStructure).some((property) => {
      const dataTypes = [].concat(dataStructure[property])
      return dataTypes.every((dataType) => typeof data[property] != dataType)
    })
    if (containsInvalidFields) throw new TypeError(`expected data structure: ${JSON.stringify(dataStructure, null, 2)}`)
    Object.assign(this, { type, data, id: generateId(), metadata: createMetadata() })
  }
  Event.type = type
  return Event
}

export const setIdGenerator = (idGenerator) => (generateId = idGenerator)
export const setMetadataProvider = (metadataProvider) => (createMetadata = metadataProvider)
