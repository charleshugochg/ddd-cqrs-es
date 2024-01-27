import { createMessageType } from '../../../shared/domain/messageTypeFactory.mjs'

export const AddNewTaskToTaskBoardCommand = createMessageType('AddNewTaskToTaskBoard', {
  taskId: 'string',
  taskBoardId: 'string',
  title: 'string',
  description: 'string',
  status: ['string', 'undefined'],
  assigneeId: ['string', 'undefined'],
})

export const RemoveTaskFromTaskBoardCommand = createMessageType('RemoveTaskFromTaskBoard', {
  taskBoardId: 'string',
  taskId: 'string',
})

export const UpdateTaskTitleCommand = createMessageType('UpdateTaskTitle', {
  taskId: 'string',
  title: 'string',
})

export const UpdateTaskDescriptionCommand = createMessageType('UpdateTaskDescription', {
  taskId: 'string',
  description: 'string',
})

export const UpdateTaskStatusCommand = createMessageType('UpdateTaskStatus', {
  taskId: 'string',
  status: 'string',
})

export const UpdateTaskAssigneeCommand = createMessageType('UpdateTaskAssignee', {
  taskId: 'string',
  assigneeId: 'string',
})
