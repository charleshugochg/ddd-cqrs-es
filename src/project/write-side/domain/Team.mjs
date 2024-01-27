import { verify } from '../../../shared/domain/verify.mjs'
import { TeamMemberAddedToTeamEvent, TeamMemberRemovedFromTeamEvent } from '../../domain/events.mjs'

export class Team {
  id
  #teamMemberIds = []
  #newDomainEvents = []

  constructor({ id, initialTeamMemberIds = [] }) {
    verify('valid id', id != null)
    Object.defineProperty(this, 'id', { value: id, writable: false })
    this.#teamMemberIds = []
    initialTeamMemberIds.forEach((teamMemberId) => this.addMember(teamMemberId))
  }

  addMember(teamMemberId) {
    if (!this.#teamMemberIds.includes(teamMemberId)) {
      this.#teamMemberIds.push(teamMemberId)
      this.#newDomainEvents.push(new TeamMemberAddedToTeamEvent({ teamId: this.id, teamMemberId }))
    }
  }

  removeMember(teamMemberIdToRemove) {
    const indexToRemove = this.#teamMemberIds.indexOf(teamMemberIdToRemove)
    if (indexToRemove === -1) return
    this.#teamMemberIds.splice(indexToRemove, 1)
    this.#newDomainEvents.push(new TeamMemberRemovedFromTeamEvent({ teamId: this.id, teamMemberId: teamMemberIdToRemove }))
  }

  get teamMemberIds() {
    return this.#teamMemberIds.slice()
  }

  get newDomainEvents() {
    return this.#newDomainEvents
  }
}
