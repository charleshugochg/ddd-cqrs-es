import { Role } from '../domain/Role.mjs'
import { TeamMember } from '../domain/TeamMember.mjs'

export class ProjectApplicationServices {
  #projectRepository
  #projectFactory
  #teamMemberRepositoy
  #teamRepository
  #accessRegistry
  #verifyAccess

  constructor({ accessRegistry, projectRepository, projectFactory, teamMemberRepository, teamRepository }) {
    this.#projectRepository = projectRepository
    this.#projectFactory = projectFactory
    this.#teamMemberRepositoy = teamMemberRepository
    this.#teamRepository = teamRepository
    this.#accessRegistry = accessRegistry
    this.#verifyAccess = accessRegistry.verifyAccess.bind(accessRegistry)
  }

  async createProject({ projectId, name, ownerId, teamId, taskBoardId }, metadata) {
    const { subjectId } = metadata.authentication
    this.#verifyAccess(subjectId, `admin/create-project`)
    await this.#projectRepository.save(
      this.#projectFactory.createProject({ id: projectId, name, ownerId, teamId, taskBoardId })
    )
  }

  async updateProjectName({ projectId, name }, metadata) {
    const { subjectId } = metadata.authentication
    this.#verifyAccess(subjectId, `project/${projectId}`)
    const project = await this.#projectRepository.load(projectId)
    project.name = name
    await this.#projectRepository.save(project)
  }

  async addTeamMemberToTeam({ teamId, teamMemberId, userId, role }, metadata) {
    const { subjectId } = metadata.authentication
    await this.#verifyAccess(subjectId, `team/${teamId}`)
    await this.#teamMemberRepositoy.save(new TeamMember({ id: teamMemberId, userId, role: new Role(role) }))
    const team = await this.#teamRepository.load(teamId)
    team.addMember(teamMemberId)
    await this.#teamRepository.save(team)
    await this.#accessRegistry.grantAccess(userId, `team/${teamId}`)
  }

  async findProjectsByCollaboratingUser({ userId }) {
    const members = await this.#teamMemberRepositoy.findTeamMembersByUser(userId)
    const projects = await Promise.all(
      members.map(async (teamMemberId) => {
        const team = await this.#teamRepository.findTeamByTeamMember(teamMemberId)
        return await this.#projectRepository.findProjectByTeam(team.id)
      })
    )
    return projects.map(({ id, name, ownerId, teamId, taskBoardId }) => ({ id, name, ownerId, teamId, taskBoardId }))
  }

  async findProjectsByOwner({ userId }) {
    const projects = await this.#projectRepository.findProjectsByOwner(userId)
    return projects.map(({ id, name, ownerId, teamId, taskBoardId }) => ({ id, name, ownerId, teamId, taskBoardId }))
  }

  async removeTeamMemberFromTeam({ teamId, teamMemberId }, metadata) {
    const { subjectId } = metadata.authentication
    await this.#verifyAccess(subjectId, `team/${teamId}`)
    const team = await this.#teamRepository.load(teamId)
    team.removeMember(teamMemberId)
    await this.#teamRepository.save(team)
    const teamMember = await this.#teamMemberRepositoy.load(teamMemberId)
    await this.#accessRegistry.revokeAccess(teamMember.userId)
  }

  async updateTeamMemberRole({ teamMemberId, role }, metadata) {
    const teamMember = await this.#teamMemberRepositoy.load(teamMemberId)
    teamMember.role = new Role(role)
    await this.#teamMemberRepositoy.save(teamMember)
  }
}
