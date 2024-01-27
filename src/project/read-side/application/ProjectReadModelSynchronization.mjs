import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'
import {
  ProjectCreatedEvent,
  ProjectRenamedEvent,
  TeamMemberAddedToTeamEvent,
  TeamMemberCreatedEvent,
  TeamMemberRemovedFromTeamEvent,
} from '../../domain/events.mjs'

export class ProjectReadModelSynchronization {
  #eventBus
  #projectReadModelStorage
  #teamMemberReadModelStorage

  constructor({ projectReadModelStorage, teamMemberReadModelStorage, eventBus }) {
    this.#projectReadModelStorage = projectReadModelStorage
    this.#teamMemberReadModelStorage = teamMemberReadModelStorage
    this.#eventBus = eventBus
  }

  activate() {
    ;[
      ProjectCreatedEvent,
      ProjectRenamedEvent,
      TeamMemberCreatedEvent,
      TeamMemberAddedToTeamEvent,
      TeamMemberRemovedFromTeamEvent,
    ].forEach((Event) => {
      this.#eventBus.subscribe(Event.type, (event) => this.handleEvent(event))
    })
  }

  handleEvent = createMessageForwarder(this, { messageSurfix: 'Event' })

  async handleProjectCreatedEvent({ data }) {
    const { projectId, name, ownerId, teamId, taskBoardId } = data
    const updates = { id: projectId, name, ownerId, teamId, taskBoardId }
    await this.#projectReadModelStorage.update(projectId, updates)
  }

  async handleProjectRenamedEvent({ data }) {
    const { projectId, name } = data
    await this.#projectReadModelStorage.update(projectId, { name })
  }

  async handleTeamMemberCreatedEvent({ data }) {
    const { teamMemberId, userId, role } = data
    const updates = { id: teamMemberId, userId, role }
    await this.#teamMemberReadModelStorage.update(teamMemberId, updates)
  }

  async handleTeamMemberAddedToTeamEvent({ data }) {
    const { teamMemberId, teamId } = data
    await this.#teamMemberReadModelStorage.update(teamMemberId, { teamId })
  }

  async handleTeamMemberRemovedFromTeamEvent({ data }) {
    const { teamMemberId } = data
    await this.#teamMemberReadModelStorage.update(teamMemberId, { teamId: null })
  }
}
