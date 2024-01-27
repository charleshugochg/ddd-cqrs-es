import { createMessageType } from '../../../shared/domain/messageTypeFactory.mjs'

export const FindUserByEmailQuery = createMessageType('FindUserByEmail', {
  email: 'string',
})
