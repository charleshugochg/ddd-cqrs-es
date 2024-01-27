import { createEventType } from '../../shared/domain/eventTypeFactory.mjs'

export const ProjectCreatedEvent = createEventType('ProjectCreated', {
  projectId: 'string',
  name: 'string',
  ownerId: 'string',
  teamId: 'string',
  taskBoardId: 'string',
})

export const ProjectRenamedEvent = createEventType('ProjectRenamed', {
  projectId: 'string',
  name: 'string',
})

export const TeamMemberCreatedEvent = createEventType('TeamMemberCreated', {
  teamMemberId: 'string',
  userId: 'string',
  role: 'string',
})

export const TeamMemberAddedToTeamEvent = createEventType('TeamMemberAddedToTeam', {
  teamId: 'string',
  teamMemberId: 'string',
})

export const TeamMemberRemovedFromTeamEvent = createEventType('TeamMemberRemovedFromTeam', {
  teamId: 'string',
  teamMemberId: 'string',
})
