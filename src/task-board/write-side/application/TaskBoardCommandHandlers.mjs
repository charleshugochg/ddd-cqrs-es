import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'
import { Task } from '../domain/Task.mjs'

export class TaskBoardCommandHandlers {
  #taskRepository
  #taskBoardRepository
  #accessRegistry
  #verifyAccess

  constructor({ accessRegistry, taskRepository, taskBoardRepository }) {
    this.#accessRegistry = accessRegistry
    this.#verifyAccess = accessRegistry.verifyAccess.bind(accessRegistry)
    this.#taskRepository = taskRepository
    this.#taskBoardRepository = taskBoardRepository
  }

  handleCommand = createMessageForwarder(this, { messageSurfix: 'Command' })

  async handleAddNewTaskToTaskBoardCommand({ data, metadata }) {
    const { taskId, title, description, status, assigneeId, taskBoardId } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `task-board/${taskBoardId}`)
    const task = new Task({ id: taskId, title, description, status, assigneeId })
    await this.#taskRepository.save(task)
    const taskBoard = await this.#taskBoardRepository.load(taskBoardId)
    taskBoard.addTask(taskId)
    await this.#taskBoardRepository.save(taskBoard)
    await this.#accessRegistry.grantImplicitAccess(`task-board/${taskBoardId}`, `task/${taskId}`)
  }

  async handleRemoveTaskFromTaskBoardCommand({ data, metadata }) {
    const { taskBoardId, taskId } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `task-board/${taskBoardId}`)
    const taskBoard = await this.#taskBoardRepository.load(taskBoardId)
    taskBoard.removeTask(taskId)
    await this.#taskBoardRepository.save(taskBoard)
    await this.#accessRegistry.revokeImplicitAccess(`task/${taskId}`)
  }

  async handleUpdateTaskTitleCommand({ data, metadata }) {
    const { taskId, title } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `task/${taskId}`)
    const task = await this.#taskRepository.load(taskId)
    task.title = title
    await this.#taskRepository.save(task)
  }

  async handleUpdateTaskDescriptionCommand({ data, metadata }) {
    const { taskId, description } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `task/${taskId}`)
    const task = await this.#taskRepository.load(taskId)
    task.description = description
    await this.#taskRepository.save(task)
  }

  async handleUpdateTaskAssigneeCommand({ data: { taskId, assigneeId }, metadata }) {
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `task/${taskId}`)
    const task = await this.#taskRepository.load(taskId)
    task.assigneeId = assigneeId
    await this.#taskRepository.save(task)
  }

  async handleUpdateTaskStatusCommand({ data: { taskId, status }, metadata }) {
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `task/${taskId}`)
    const task = await this.#taskRepository.load(taskId)
    task.status = status
    await this.#taskRepository.save(task)
  }
}
