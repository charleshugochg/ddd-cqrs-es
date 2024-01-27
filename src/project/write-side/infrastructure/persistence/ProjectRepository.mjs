import { ConcurrencySafeFilesystemRepository } from '../../../../shared/infrastructure/persistence/ConcurrencySafeFilesystemRepository.mjs'

export class ProjectRepository extends ConcurrencySafeFilesystemRepository {
  constructor({ storageDirectory, projectFactory }) {
    super({
      storageDirectory,
      convertToData: ({ id, name, ownerId, teamId, taskBoardId }) => ({ id, name, ownerId, teamId, taskBoardId }),
      convertToEntity: ({ id, name, ownerId, teamId, taskBoardId }) =>
        projectFactory.reconstituteProject({ id, name, ownerId, teamId, taskBoardId }),
    })
  }

  async findProjectByOwner(ownerId) {
    const projects = await this.loadAll()
    return projects.find((project) => project.ownerId === ownerId)
  }

  async findProjectByTeam(teamId) {
    const projects = await this.loadAll()
    return projects.find((project) => project.teamId === teamId)
  }
}
