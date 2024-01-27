import { Email } from '../domain/Email.mjs'
import { UserEmailChangedEvent } from '../../domain/events.mjs'

export class UserDomainEventHandlers {
  #emailRegistry
  #eventBus

  constructor({ emailRegistry, eventBus }) {
    this.#emailRegistry = emailRegistry
    this.#eventBus = eventBus
  }

  activate() {
    this.#eventBus.subscribe(UserEmailChangedEvent.type, ({ data }) => {
      this.#emailRegistry.setUserEmail(data.userId, new Email(data.email))
    })
  }
}
