import { createMessageType } from '../../../shared/application/messageTypeFactory.mjs'

export const FindProjectsByOwnerQuery = createMessageType('FindProjectsByOwner', {
  userId: 'string',
})

export const FindProjectsByCollaboratingUserQuery = createMessageType('FindProjectsByCollaboratingUser', {
  userId: 'string',
})
