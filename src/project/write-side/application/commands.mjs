import { createMessageType } from '../../../shared/application/messageTypeFactory.mjs'

export const CreateProjectCommand = createMessageType('CreateProject', {
  name: 'string',
  projectId: 'string',
  ownerId: 'string',
  teamId: 'string',
  taskBoardId: 'string',
})

export const AddTeamMemberToTeamCommand = createMessageType('AddTeamMemberToTeam', {
  teamId: 'string',
  teamMemberId: 'string',
  userId: 'string',
  role: 'string',
})

export const RemoveTeamMemberFromTeamCommand = createMessageType('RemoveTeamMemberFromTeam', {
  teamId: 'string',
  teamMemberId: 'string',
})

export const UpdateTeamMemberRoleCommand = createMessageType('UpdateTeamMemberRole', {
  teamMemberId: 'string',
  role: 'string',
})

export const UpdateProjectNameCommand = createMessageType('UpdateProjectName', {
  projectId: 'string',
  name: 'string',
})
