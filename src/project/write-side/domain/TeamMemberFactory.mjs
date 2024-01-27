import { TeamMember } from './TeamMember.mjs'

export class TeamMemberFactory {
  createTeamMember({ id, userId, role }) {
    return new TeamMember({ id, userId, role, isExistingMember: false })
  }

  reconstitudeTeamMember({ id, userId, role }) {
    return new TeamMember({ id, userId, role, isExistingMember: true })
  }
}
