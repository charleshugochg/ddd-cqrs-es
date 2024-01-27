import { verify } from '../../../shared/domain/verify.mjs'
import {
  TaskAssigneeChangedEvent,
  TaskCreatedEvent,
  TaskDescriptionChangedEvent,
  TaskStatusChangedEvent,
  TaskTitleChangedEvent,
} from '../../domain/events.mjs'

const validStatus = ['todo', 'in progress', 'done']

export class Task {
  id
  #title
  #description
  #status
  #assigneeId
  #newDomainEvents = []

  constructor({ id, title, description = '', status = 'todo', assigneeId, isExistingTask }) {
    verify('valid id', id != null)
    verify('valid title', typeof title == 'string' && !!title)
    verify('valid description', typeof description == 'string')
    verify('valid status', validStatus.includes(status))
    verify('active task assignee', status !== 'in progress' || !!assigneeId)
    Object.defineProperty(this, 'id', { value: id, writable: false })
    this.#title = title
    this.#description = description
    this.#status = status
    this.#assigneeId = assigneeId
    if (!isExistingTask)
      this.#newDomainEvents.push(
        new TaskCreatedEvent({
          taskId: id,
          title,
          description,
          status,
          assigneeId,
        })
      )
  }

  set title(title) {
    verify('valid title', typeof title == 'string' && !!title)
    this.#title = title
    this.#newDomainEvents.push(new TaskTitleChangedEvent({ taskId: this.id, title }))
  }

  get title() {
    return this.#title
  }

  set description(description) {
    verify('valid description', typeof description == 'string')
    this.#description = description
    this.#newDomainEvents.push(new TaskDescriptionChangedEvent({ taskId: this.id, description }))
  }

  get description() {
    return this.#description
  }

  set status(status) {
    verify('valid status', validStatus.includes(status))
    verify('active task assignee', status !== 'in progress' || !!this.assigneeId)
    this.#status = status
    this.#newDomainEvents.push(new TaskStatusChangedEvent({ taskId: this.id, status }))
  }

  get status() {
    return this.#status
  }

  set assigneeId(assigneeId) {
    verify('active task assignee', this.status !== 'in progress' || !!assigneeId)
    this.#assigneeId = assigneeId
    this.#newDomainEvents.push(new TaskAssigneeChangedEvent({ taskId: this.id, assigneeId }))
  }

  get assigneeId() {
    return this.#assigneeId
  }

  get newDomainEvents() {
    return this.#newDomainEvents
  }
}
