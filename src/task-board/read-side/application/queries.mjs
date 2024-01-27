import { createMessageType } from '../../../shared/domain/messageTypeFactory.mjs'

export const FindTasksOnTaskBoardQuery = createMessageType('FindTasksOnTaskBoard', { taskBoardId: 'string' })
