import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'

export class ProjectQueryHandlers {
  #projectReadModelStorage
  #teamMemberReadModelStorage

  constructor({ projectReadModelStorage, teamMemberReadModelStorage }) {
    this.#projectReadModelStorage = projectReadModelStorage
    this.#teamMemberReadModelStorage = teamMemberReadModelStorage
  }

  handleQuery = createMessageForwarder(this, { messageSurfix: 'Query' })

  async handleFindProjectsByOwnerQuery({ data }) {
    const { userId } = data
    return this.#projectReadModelStorage.findByIndex('ownerId', userId)
  }

  async handleFindProjectsByCollaboratingUserQuery({ data }) {
    const { userId } = data
    const members = await this.#teamMemberReadModelStorage.findByIndex('userId', userId)
    const projectsByTeamMember = await Promise.all(
      members.map((member) => this.#projectReadModelStorage.findByIndex('teamId', member.teamId))
    )
    return projectsByTeamMember.flat(1)
  }
}
