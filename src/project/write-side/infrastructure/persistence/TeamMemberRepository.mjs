import { ConcurrencySafeFilesystemRepository } from '../../../../shared/infrastructure/persistence/ConcurrencySafeFilesystemRepository.mjs'
import { Role } from '../../domain/Role.mjs'

export class TeamMemberRepository extends ConcurrencySafeFilesystemRepository {
  constructor({ storageDirectory, teamMemberFactory }) {
    super({
      storageDirectory,
      convertToData: (entity) => ({ id: entity.id, userId: entity.userId, role: entity.role.name }),
      convertToEntity: (data) =>
        teamMemberFactory.reconstitudeTeamMember({ id: data.id, userId: data.userId, role: new Role(data.role) }),
    })
  }

  async findTeamMembersByUser(userId) {
    const members = await this.loadAll()
    return members.filter((member) => member.userId === userId).map((member) => member.id)
  }
}
