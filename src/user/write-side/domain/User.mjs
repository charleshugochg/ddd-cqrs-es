import { verify } from '../../../shared/domain/verify.mjs'
import { Email } from './Email.mjs'
import { Role } from './Role.mjs'
import {
  UserCreatedEvent,
  UserEmailChangedEvent,
  UserRoleChangedEvent,
  UsernameChangedEvent,
} from '../../domain/events.mjs'

export class User {
  id
  #username
  #email
  #emailAvailability
  #password
  #role
  #newDomainEvents = []

  constructor({ id, emailAvailability, username, email, password, role, isNewUser }) {
    this.#emailAvailability = emailAvailability
    verify('valid id', id != null)
    verify('valid username', typeof username == 'string' && username != null)
    verify('valid email', email.constructor == Email)
    verify('unused email', !isNewUser || this.#emailAvailability.isEmailAvailable(email))
    verify('valid role', role != null && role.constructor == Role)
    Object.defineProperty(this, 'id', { value: id, writable: false })
    this.#email = email
    this.#username = username
    this.#role = role
    this.password = password
    if (isNewUser)
      this.#newDomainEvents.push(
        new UserCreatedEvent({
          userId: id,
          username,
          email: email.value,
          role: role.name,
        })
      )
  }

  set username(username) {
    verify('valid username', typeof username == 'string' && username != null)
    this.#username = username
    this.#newDomainEvents.push(new UsernameChangedEvent({ userId: this.id, username }))
  }

  get username() {
    return this.#username
  }

  set email(email) {
    verify('valid email', email.constructor == Email)
    verify('unused email', this.#emailAvailability.isEmailAvailable(email))
    this.#email = email
    this.#newDomainEvents.push(new UserEmailChangedEvent({ userId: this.id, email: email.value }))
  }

  get email() {
    return this.#email
  }

  set password(password) {
    verify('valid password', typeof password == 'string' && !!password)
    this.#password = password
  }

  get password() {
    return this.#password
  }

  isPasswordMatching(password) {
    return this.#password === password
  }

  set role(role) {
    verify('valid role', role != null && role.constructor == Role)
    this.#role = role
    this.#newDomainEvents.push(new UserRoleChangedEvent({ userId: this.id, role: role.name }))
  }

  get role() {
    return this.#role
  }

  get newDomainEvents() {
    return this.#newDomainEvents
  }
}
