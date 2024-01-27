import { User } from './User.mjs'

export class UserFactory {
  #emailRegistry

  constructor({ emailRegistry }) {
    this.#emailRegistry = emailRegistry
  }

  createUser({ id, username, email, password, role }) {
    return new User({ id, email, username, password, role, emailAvailability: this.#emailRegistry, isNewUser: true })
  }

  reconstituteUser({ id, username, email, password, role }) {
    return new User({ id, email, username, password, role, emailAvailability: this.#emailRegistry, isNewUser: false })
  }
}
