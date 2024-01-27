import { verify } from '../../../shared/domain/verify.mjs'
import { ProjectCreatedEvent, ProjectRenamedEvent } from '../../domain/events.mjs'

export class Project {
  id
  #name
  ownerId
  teamId
  taskBoardId
  #newDomainEvents = []

  constructor({ id, name, ownerId, teamId, taskBoardId, isExistingProject = false }) {
    verify('valid id', id != null)
    verify('valid project data', ownerId && teamId && taskBoardId)
    Object.defineProperty(this, 'id', { value: id, writable: false })
    Object.defineProperty(this, 'ownerId', { value: ownerId, writable: false })
    Object.defineProperty(this, 'teamId', { value: teamId, writable: false })
    Object.defineProperty(this, 'taskBoardId', { value: taskBoardId, writable: false })
    this.name = name
    if (!isExistingProject)
      this.#newDomainEvents.push(new ProjectCreatedEvent({ projectId: id, name, ownerId, teamId, taskBoardId }))
  }

  set name(name) {
    verify('valid name', typeof name == 'string' && name.length > 0)
    this.#name = name
    this.#newDomainEvents.push(new ProjectRenamedEvent({ projectId: this.id, name: this.name }))
  }

  get name() {
    return this.#name
  }

  get newDomainEvents() {
    return this.#newDomainEvents
  }
}
