import { createEventType } from '../../shared/domain/eventTypeFactory.mjs'

export const TaskCreatedEvent = createEventType('TaskCreated', {
  taskId: 'string',
  title: 'string',
  description: 'string',
  status: ['string', 'undefined'],
  assigneeId: ['string', 'undefined'],
})

export const TaskTitleChangedEvent = createEventType('TaskTitleChanged', {
  taskId: 'string',
  title: 'string',
})

export const TaskDescriptionChangedEvent = createEventType('TaskDescriptionChanged', {
  taskId: 'string',
  description: 'string',
})

export const TaskAssigneeChangedEvent = createEventType('TaskAssigneeChanged', {
  taskId: 'string',
  assigneeId: ['string', 'undefined'],
})

export const TaskStatusChangedEvent = createEventType('TaskStatusChanged', {
  taskId: 'string',
  status: 'string',
})

export const TaskAddedToTaskBoardEvent = createEventType('TaskAddedToTaskBoard', {
  taskBoardId: 'string',
  taskId: 'string',
})

export const TaskRemovedFromTaskBoardEvent = createEventType('TaskRemovedFromTaskBoard', {
  taskBoardId: 'string',
  taskId: 'string',
})
