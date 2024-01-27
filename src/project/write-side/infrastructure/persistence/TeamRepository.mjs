import { ConcurrencySafeFilesystemRepository } from '../../../../shared/infrastructure/persistence/ConcurrencySafeFilesystemRepository.mjs'
import { Team } from '../../domain/Team.mjs'

export class TeamRepository extends ConcurrencySafeFilesystemRepository {
  constructor({ storageDirectory }) {
    super({
      storageDirectory,
      convertToData: (entity) => ({ id: entity.id, teamMemberIds: entity.teamMemberIds }),
      convertToEntity: (data) => new Team({ id: data.id, initialTeamMemberIds: data.teamMemberIds }),
    })
  }

  async findTeamByTeamMember(teamMemberId) {
    const teams = await this.loadAll()
    return teams.find((team) => team.teamMemberIds.includes(teamMemberId))
  }
}
