import { TeamMemberCreatedEvent } from '../../domain/events.mjs'
import { verify } from '../../../shared/domain/verify.mjs'

import { Role } from './Role.mjs'

export class TeamMember {
  id
  userId
  #role
  #newDomainEvents = []

  constructor({ id, userId, role, isExistingMember }) {
    verify('valid id', id != null)
    verify('valid user id', userId != null)
    Object.defineProperty(this, 'id', { value: id, writable: false })
    Object.defineProperty(this, 'userId', { value: userId, writable: false })
    this.role = role
    if (!isExistingMember)
      this.#newDomainEvents.push(new TeamMemberCreatedEvent({ teamMemberId: id, userId, role: role.name }))
  }

  set role(role) {
    verify('valid role', role != null && role.constructor == Role)
    this.#role = role
  }

  get role() {
    return this.#role
  }

  get newDomainEvents() {
    return this.#newDomainEvents
  }
}
