import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'
import {
  TaskAddedToTaskBoardEvent,
  TaskAssigneeChangedEvent,
  TaskCreatedEvent,
  TaskDescriptionChangedEvent,
  TaskRemovedFromTaskBoardEvent,
  TaskStatusChangedEvent,
  TaskTitleChangedEvent,
} from '../../domain/events.mjs'

export class TaskBoardReadModelSynchronization {
  #taskReadModelStorage
  #eventBus

  constructor({ taskReadModelStorage, eventBus }) {
    this.#taskReadModelStorage = taskReadModelStorage
    this.#eventBus = eventBus
  }

  activate() {
    ;[
      TaskCreatedEvent,
      TaskTitleChangedEvent,
      TaskDescriptionChangedEvent,
      TaskAssigneeChangedEvent,
      TaskStatusChangedEvent,
      TaskAddedToTaskBoardEvent,
      TaskRemovedFromTaskBoardEvent,
    ].forEach((Event) => {
      this.#eventBus.subscribe(Event.type, this.handleEvent.bind(this))
    })
  }

  handleEvent = createMessageForwarder(this, { messageSurfix: 'Event' })

  async handleTaskCreatedEvent({ data }) {
    const { taskId, title, description, status, assigneeId } = data
    const updates = { id: taskId, title, description, status, assigneeId }
    await this.#taskReadModelStorage.update(taskId, updates)
  }

  async handleTaskTitleChangedEvent({ data }) {
    const { taskId, title } = data
    await this.#taskReadModelStorage.update(taskId, { title })
  }

  async handleTaskDescriptionChangedEvent({ data }) {
    const { taskId, description } = data
    await this.#taskReadModelStorage.update(taskId, { description })
  }

  async handleTaskAssigneeChangedEvent({ data }) {
    const { taskId, assigneeId } = data
    await this.#taskReadModelStorage.update(taskId, { assigneeId })
  }

  async handleTaskStatusChangedEvent({ data }) {
    const { taskId, status } = data
    await this.#taskReadModelStorage.update(taskId, { status })
  }

  async handleTaskAddedToTaskBoardEvent({ data }) {
    const { taskBoardId, taskId } = data
    await this.#taskReadModelStorage.update(taskId, { id: taskId, taskBoardId })
  }

  async handleTaskRemovedFromTaskBoardEvent({ data }) {
    const { taskId } = data
    await this.#taskReadModelStorage.update(taskId, { id: taskId, taskBoardId: null })
  }
}
