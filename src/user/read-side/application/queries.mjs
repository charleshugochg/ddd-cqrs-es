import { createMessageType } from '../../../shared/application/messageTypeFactory.mjs'

export const FindUserByEmailQuery = createMessageType('FindUserByEmail', {
  email: 'string',
})
