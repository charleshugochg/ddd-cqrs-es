import { createMessageType } from '../../../shared/application/messageTypeFactory.mjs'

export const FindTasksOnTaskBoardQuery = createMessageType('FindTasksOnTaskBoard', { taskBoardId: 'string' })
