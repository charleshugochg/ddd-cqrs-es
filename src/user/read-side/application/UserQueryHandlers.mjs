import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'

export class UserQueryHandlers {
  #userReadModelStorage

  constructor({ userReadModelStorage }) {
    this.#userReadModelStorage = userReadModelStorage
  }

  handleQuery = createMessageForwarder(this, { messageSurfix: 'Query' })

  async handleFindUserByEmailQuery({ data }) {
    const { email } = data
    return await this.#userReadModelStorage.findByIndex('email', email)
  }
}
