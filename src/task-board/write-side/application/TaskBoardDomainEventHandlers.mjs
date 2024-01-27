import { TaskBoard } from '../domain/TaskBoard.mjs'
import { TaskAssigneeChangedEvent, TaskCreatedEvent, TaskStatusChangedEvent } from '../../domain/events.mjs'
import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'

export class TaskBoardDomainEventHandlers {
  #taskAssigneeReadModelStorage
  #taskRepository
  #taskBoardRepository
  #accessRegistry
  #eventBus

  constructor({ taskAssigneeReadModelStorage, taskRepository, taskBoardRepository, accessRegistry, eventBus }) {
    this.#taskAssigneeReadModelStorage = taskAssigneeReadModelStorage
    this.#taskRepository = taskRepository
    this.#taskBoardRepository = taskBoardRepository
    this.#accessRegistry = accessRegistry
    this.#eventBus = eventBus
  }

  activate() {
    ;[TaskCreatedEvent, TaskAssigneeChangedEvent].forEach((Event) =>
      this.#eventBus.subscribe(Event.type, this.handleEvent.bind(this))
    )
    ;['ProjectCreated', 'TeamMemberRemovedFromTeam'].forEach((eventType) =>
      this.#eventBus.subscribe(eventType, this.handleEvent.bind(this))
    )
  }

  handleEvent = createMessageForwarder(this, { messageSurfix: 'Event' })

  async handleProjectCreatedEvent({ data }) {
    await this.#taskBoardRepository.save(new TaskBoard({ id: data.taskBoardId }))
    await this.#accessRegistry.grantImplicitAccess(`team/${data.teamId}`, `task-board/${data.taskBoardId}`)
  }

  handleTaskCreatedEvent({ data }) {
    const { taskId, assigneeId } = data
    this.#taskAssigneeReadModelStorage.update(taskId, { id: taskId, assigneeId })
  }

  handleTaskAssigneeChangedEvent({ data }) {
    const { taskId, assigneeId } = data
    this.#taskAssigneeReadModelStorage.update(taskId, { id: taskId, assigneeId })
  }

  async handleTeamMemberRemovedFromTeamEvent({ data }) {
    const { teamMemberId } = data
    const tasks = await this.#taskAssigneeReadModelStorage.findByIndex('assigneeId', teamMemberId)
    await Promise.all(
      tasks.map(async ({ id }) => {
        const task = await this.#taskRepository.load(id)
        if (task.status === 'in progress') task.status = 'todo'
        task.assigneeId = undefined
        await this.#taskRepository.save(task)
      })
    )
  }
}
