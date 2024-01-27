import { verify } from '../../../shared/domain/verify.mjs'
import { TaskAddedToTaskBoardEvent, TaskRemovedFromTaskBoardEvent } from '../../domain/events.mjs'

export class TaskBoard {
  id
  #taskIds = []
  #newDomainEvents = []

  constructor({ id, initialTaskIds = [] }) {
    verify('valid id', id != null)
    Object.defineProperty(this, 'id', { value: id, writable: false })
    this.#taskIds = initialTaskIds
  }

  addTask(taskId) {
    verify('valid task id', taskId != null && typeof taskId == 'string')
    this.#taskIds.push(taskId)
    this.#newDomainEvents.push(new TaskAddedToTaskBoardEvent({ taskBoardId: this.id, taskId }))
  }

  removeTask(taskId) {
    const index = this.#taskIds.indexOf(taskId)
    verify('task is on board', index > -1)
    this.#taskIds.splice(index, 1)
    this.#newDomainEvents.push(new TaskRemovedFromTaskBoardEvent({ taskBoardId: this.id, taskId }))
  }

  get taskIds() {
    return this.#taskIds.slice()
  }

  get newDomainEvents() {
    return this.#newDomainEvents.slice()
  }
}
