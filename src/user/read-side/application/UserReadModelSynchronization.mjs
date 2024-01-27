import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'
import {
  UserCreatedEvent,
  UserEmailChangedEvent,
  UserRoleChangedEvent,
  UsernameChangedEvent,
} from '../../domain/events.mjs'

export class UserReadModelSynchronization {
  #userReadModelStorage
  #eventBus

  constructor({ userReadModelStorage, eventBus }) {
    this.#userReadModelStorage = userReadModelStorage
    this.#eventBus = eventBus
  }

  activate() {
    ;[UserCreatedEvent, UsernameChangedEvent, UserEmailChangedEvent, UserRoleChangedEvent].forEach((Event) => {
      this.#eventBus.subscribe(Event.type, (event) => this.handleEvent(event))
    })
  }

  handleEvent = createMessageForwarder(this, { messageSurfix: 'Event' })

  async handleUserCreatedEvent({ data }) {
    const { userId: id, username, email, role } = data
    await this.#userReadModelStorage.update(id, { id, username, email, role })
  }

  async handleUsernameChangedEvent({ data }) {
    const { userId, username } = data
    await this.#userReadModelStorage.update(userId, { username })
  }

  async handleUserEmailChangedEvent({ data }) {
    const { userId, email } = data
    await this.#userReadModelStorage.update(userId, { email })
  }

  async handleUserRoleChangedEvent({ data }) {
    const { userId, role } = data
    await this.#userReadModelStorage.update(userId, { role })
  }
}
