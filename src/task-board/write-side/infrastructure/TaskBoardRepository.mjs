import { ConcurrencySafeFilesystemRepository } from '../../../shared/infrastructure/persistence/ConcurrencySafeFilesystemRepository.mjs'
import { TaskBoard } from '../domain/TaskBoard.mjs'

export class TaskBoardRepository extends ConcurrencySafeFilesystemRepository {
  constructor({ storageDirectory }) {
    super({
      storageDirectory,
      convertToData: (entity) => {
        return { id: entity.id, taskIds: entity.taskIds }
      },
      convertToEntity: (data) => {
        return new TaskBoard({ id: data.id, initialTaskIds: data.taskIds })
      },
    })
  }
}
