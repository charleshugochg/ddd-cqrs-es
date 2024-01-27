import { ConcurrencySafeFilesystemRepository } from '../../../shared/infrastructure/persistence/ConcurrencySafeFilesystemRepository.mjs'
import { Task } from '../domain/Task.mjs'

export class TaskRepository extends ConcurrencySafeFilesystemRepository {
  constructor({ storageDirectory }) {
    super({
      storageDirectory,
      convertToData: ({ id, title, description, status, assigneeId }) => ({ id, title, description, status, assigneeId }),
      convertToEntity: ({ id, title, description, status, assigneeId }) =>
        new Task({ id, title, description, status, assigneeId, isExistingTask: true }),
    })
  }
}
