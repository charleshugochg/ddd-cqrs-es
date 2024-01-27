import { Team } from '../domain/Team.mjs'
import { ProjectCreatedEvent } from '../../domain/events.mjs'

export class ProjectDomainEventHandlers {
  constructor({ teamRepository, accessRegistry, eventBus }) {
    this.activate = () => {
      eventBus.subscribe(ProjectCreatedEvent.type, async ({ data }) => {
        await teamRepository.save(new Team({ id: data.teamId }))
        await accessRegistry.grantImplicitAccess(`team/${data.teamId}`, `project/${data.projectId}`)
      })
    }
  }
}
