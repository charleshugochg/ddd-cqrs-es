import { createMessageType } from '../../../shared/domain/messageTypeFactory.mjs'

export const CreateUserCommand = createMessageType('CreateUser', {
  userId: 'string',
  username: 'string',
  email: 'string',
  password: 'string',
  role: 'string',
})

export const LoginUserCommand = createMessageType('LoginUser', {
  userId: 'string',
  password: 'string',
  authenticationToken: 'string',
})

export const UpdateUsernameCommand = createMessageType('UpdateUsername', {
  userId: 'string',
  username: 'string',
})

export const UpdateUserPasswordCommand = createMessageType('UpdateUserPassword', {
  userId: 'string',
  password: 'string',
})

export const UpdateUserEmailCommand = createMessageType('UpdateUserEmail', {
  userId: 'string',
  email: 'string',
})

export const UpdateUserRole = createMessageType('UpdateUserRole', {
  userId: 'string',
  role: 'string',
})
