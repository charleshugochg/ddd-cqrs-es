import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'

export class TaskBoardQueryHandlers {
  #taskReadModelStorage

  constructor({ taskReadModelStorage }) {
    this.#taskReadModelStorage = taskReadModelStorage
  }

  handleQuery = createMessageForwarder(this, { messageSurfix: 'Query' })

  async handleFindTasksOnTaskBoardQuery({ data: { taskBoardId } }) {
    return await this.#taskReadModelStorage.findByIndex('taskBoardId', taskBoardId)
  }
}
