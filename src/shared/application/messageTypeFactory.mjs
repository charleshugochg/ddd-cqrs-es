let generateId = () => ''
let createDefaultMetadata = () => ({})

export const createMessageType = (type, dataSturcture) =>
  function Message({ data, metadata = {} }) {
    validateData(data, dataSturcture)
    Object.assign(this, { type, data, id: generateId(), metadata: { ...createDefaultMetadata(), ...metadata } })
  }

export const setIdGenerator = (idGenerator) => {
  generateId = idGenerator
}

export const setDefaultMetadataProvider = (defaultMetadataProvider) => {
  createDefaultMetadata = defaultMetadataProvider
}

const validateData = (data, dataStructure) => {
  const allFieldsValid = Object.keys(dataStructure).every((property) => {
    const dataTypes = [].concat(dataStructure[property])
    return isValidDataType(data[property], dataTypes)
  })
  if (!allFieldsValid) throw new TypeError(`exptected data structure: ${JSON.stringify(dataStructure, null, 2)}`)
}

const isValidDataType = (data, dataTypes) => {
  return dataTypes.some((dataType) => typeof data == dataType)
}
