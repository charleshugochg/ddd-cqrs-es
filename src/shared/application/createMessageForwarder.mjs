export const createMessageForwarder =
  (target, { messageSurfix } = { messageSurfix: '' }) =>
  (message) => {
    const messageHandlerName = `handle${message.type}${messageSurfix}`
    if (!target[messageHandlerName]) throw new Error(`invalid message: ${JSON.stringify(message)}`)
    return target[messageHandlerName](message)
  }
