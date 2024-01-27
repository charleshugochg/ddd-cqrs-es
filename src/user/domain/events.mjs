import { createEventType } from '../../shared/domain/eventTypeFactory.mjs'

export const UserCreatedEvent = createEventType('UserCreated', {
  userId: 'string',
  username: 'string',
  email: 'string',
  role: 'string',
})

export const UsernameChangedEvent = createEventType('UsernameChanged', {
  userId: 'string',
  username: 'string',
})

export const UserEmailChangedEvent = createEventType('UserEmailChanged', {
  userId: 'string',
  email: 'string',
})

export const UserRoleChangedEvent = createEventType('UserRoleChanged', {
  userId: 'string',
  role: 'string',
})
