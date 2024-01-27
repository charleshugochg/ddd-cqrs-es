import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'
import { Role } from '../domain/Role.mjs'
import { TeamMember } from '../domain/TeamMember.mjs'

export class ProjectCommandHandlers {
  #accessRegistry
  #verifyAccess
  #projectRepository
  #projectFactory
  #teamRepository
  #teamMemberRepository

  constructor({ accessRegistry, projectRepository, projectFactory, teamRepository, teamMemberRepository }) {
    this.#accessRegistry = accessRegistry
    this.#verifyAccess = accessRegistry.verifyAccess.bind(accessRegistry)
    this.#projectRepository = projectRepository
    this.#projectFactory = projectFactory
    this.#teamRepository = teamRepository
    this.#teamMemberRepository = teamMemberRepository
  }

  handleCommand = createMessageForwarder(this, { messageSurfix: 'Command' })

  async handleCreateProjectCommand({ data, metadata }) {
    const { projectId, name, ownerId, teamId, taskBoardId } = data
    const { subjectId } = metadata.authentication
    this.#verifyAccess(subjectId, `admin/create-project`)
    await this.#projectRepository.save(
      this.#projectFactory.createProject({ id: projectId, name, ownerId, teamId, taskBoardId })
    )
  }

  async handleUpdateProjectNameCommand({ data, metadata }) {
    const { projectId, name } = data
    const { subjectId } = metadata.authentication
    this.#verifyAccess(subjectId, `project/${projectId}`)
    const project = await this.#projectRepository.load(projectId)
    project.name = name
    await this.#projectRepository.save(project)
  }

  async handleAddTeamMemberToTeamCommand({ data, metadata }) {
    const { teamId, teamMemberId, userId, role } = data
    const { subjectId } = metadata.authentication
    await this.#verifyAccess(subjectId, `team/${teamId}`)
    await this.#teamMemberRepository.save(new TeamMember({ id: teamMemberId, userId, role: new Role(role) }))
    const team = await this.#teamRepository.load(teamId)
    team.addMember(teamMemberId)
    await this.#teamRepository.save(team)
    await this.#accessRegistry.grantAccess(userId, `team/${teamId}`)
  }

  async handleRemoveTeamMemberFromTeamCommand({ data, metadata }) {
    const { teamId, teamMemberId } = data
    const { subjectId } = metadata.authentication
    await this.#verifyAccess(subjectId, `team/${teamId}`)
    const team = await this.#teamRepository.load(teamId)
    team.removeMember(teamMemberId)
    await this.#teamRepository.save(team)
    const teamMember = await this.#teamMemberRepository.load(teamMemberId)
    await this.#accessRegistry.revokeAccess(teamMember.userId)
  }

  async handleUpdateTeamMemberRoleCommand({ data }) {
    const { teamMemberId, role } = data
    const teamMember = await this.#teamMemberRepository.load(teamMemberId)
    teamMember.role = new Role(role)
    await this.#teamMemberRepository.save(teamMember)
  }
}
