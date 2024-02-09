import { createMessageForwarder } from '../../../shared/application/createMessageForwarder.mjs'
import { Email } from '../domain/Email.mjs'
import { Role } from '../domain/Role.mjs'

export class UserCommandHandlers {
  #userRepository
  #userFactory
  #hashPassword
  #authenticationTokenRegistry
  #accessRegistry
  #verifyAccess

  constructor({ userRepository, userFactory, hashPassword, authenticationTokenRegistry, accessRegistry }) {
    this.#userRepository = userRepository
    this.#userFactory = userFactory
    this.#hashPassword = hashPassword
    this.#authenticationTokenRegistry = authenticationTokenRegistry
    this.#accessRegistry = accessRegistry
    this.#verifyAccess = accessRegistry.verifyAccess.bind(accessRegistry)
    this.handleCommand.bypassAuthentication = true
  }

  handleCommand = createMessageForwarder(this, { messageSurfix: 'Command' })

  async handleLoginUserCommand({ data }) {
    const { userId, password, authenticationToken } = data
    const user = await this.#userRepository.load(userId)
    if (!user.isPasswordMatching(this.#hashPassword(password))) throw new Error('incorrect password')
    await this.#authenticationTokenRegistry.assignToken(user.id, authenticationToken)
  }

  async handleCreateUserCommand({ data, metadata }) {
    const { userId, username, email, password, role } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, 'admin/create-user')
    const user = this.#userFactory.createUser({
      id: userId,
      username,
      password: this.#hashPassword(password),
      email: new Email(email),
      role: new Role(role),
    })
    await this.#userRepository.save(user)
    // ;(await user.role.equals(new Role('admin')))
    //   ? this.#accessRegistry.grantFullAccess(userId)
    //   : this.#accessRegistry.grantAccess(userId, `user/${userId}`)
  }

  async handleUpdateUserEmailCommand({ data, metadata }) {
    const { userId, email } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `user/${userId}`)
    const user = await this.#userRepository.load(userId)
    user.email = new Email(email)
    await this.#userRepository.save(user)
  }

  async handleUpdateUsernameCommand({ data, metadata }) {
    const { userId, username } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `user/${userId}`)
    const user = await this.#userRepository.load(userId)
    user.username = username
    await this.#userRepository.save(user)
  }

  async handleUpdateUserPasswordCommand({ data, metadata }) {
    const { userId, password } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `user/${userId}`)
    const user = await this.#userRepository.load(userId)
    user.password = this.#hashPassword(password)
    await this.#userRepository.save(user)
  }

  async handleUpdateUserRole({ data, metadata }) {
    const { userId, role } = data
    // const { subjectId } = metadata.authentication
    // await this.#verifyAccess(subjectId, `user/${userId}`)
    const user = await this.#userRepository.load(userId)
    user.role = new Role(role)
    await this.#userRepository.save(user)
  }
}
