import { createMessageType } from '../../../shared/domain/messageTypeFactory.mjs'

export const FindProjectsByOwnerQuery = createMessageType('FindProjectsByOwner', {
  userId: 'string',
})

export const FindProjectsByCollaboratingUserQuery = createMessageType('FindProjectsByCollaboratingUser', {
  userId: 'string',
})
