import * as eventTypeFactory from '../shared/domain/eventTypeFactory.mjs'
import * as messageTypeFactory from '../shared/domain/messageTypeFactory.mjs'
import { AccessRegistry } from '../shared/infrastructure/AccessRegistry.mjs'
import { AuthenticationTokenRegistry } from '../shared/infrastructure/AuthenticationTokenRegistry.mjs'
import { DomainEventPublisher } from '../shared/infrastructure/DomainEventPublisher.mjs'
import { MiddlewareProxy } from '../shared/infrastructure/MiddlewareProxy.mjs'
import { createAuthenticationMiddleware } from '../shared/infrastructure/authenticationMiddlewareFactory.mjs'
import { EventBus } from '../shared/infrastructure/eventBus.mjs'
import { createMd5Hash } from '../shared/infrastructure/hash.mjs'
import { generateId } from '../shared/infrastructure/id.mjs'
import { UserCommandHandlers } from './write-side/application/UserCommandHandlers.mjs'
import { UserDomainEventHandlers } from './write-side/application/UserDomainEventHandlers.mjs'
import { EmailRegistry } from './write-side/domain/EmailRegistry.mjs'
import { UserRepository } from './write-side/infrastructure/persistence/UserRepository.mjs'
import { UserFactory } from './write-side/domain/UserFactory.mjs'
import { UserReadModelSynchronization } from './read-side/application/UserReadModelSynchronization.mjs'
import { InMemoryIndexedStorage } from '../shared/infrastructure/persistence/InMemoryIndexedStorage.mjs'
import { UserQueryHandlers } from './read-side/application/UserQueryHandlers.mjs'
import { CreateUserCommand, LoginUserCommand, UpdateUserEmailCommand } from './write-side/application/commands.mjs'
import { FindUserByEmailQuery } from './read-side/application/queries.mjs'
import { timeout } from '../shared/infrastructure/timeout.mjs'

eventTypeFactory.setIdGenerator(generateId)
messageTypeFactory.setIdGenerator(generateId)
const storageDirectory = './data/user'
const tokenStorageDirectory = './data/token'
const accessStorageDirectory = './data/access'
const eventBus = new EventBus()
const emailRegistry = new EmailRegistry()
const userFactory = new UserFactory({ emailRegistry })
const userRepository = new UserRepository({ storageDirectory, userFactory })
const authenticationTokenRegistry = new AuthenticationTokenRegistry({ storageDirectory: tokenStorageDirectory })
const accessRegistry = new AccessRegistry({ storageDirectory: accessStorageDirectory })
const publisher = new DomainEventPublisher({
  repository: userRepository,
  eventBus,
  publishedEventIdsDirectory: `${storageDirectory}/published-event-ids`,
})
publisher.activate()

const userCommandHandlers = new MiddlewareProxy(
  new UserCommandHandlers({
    userRepository,
    userFactory,
    hashPassword: createMd5Hash,
    authenticationTokenRegistry,
    accessRegistry,
    emailRegistry,
  })
)
const authenticationExtractor = ({ metadata }) => metadata.authentication
userCommandHandlers.addMiddleware(createAuthenticationMiddleware({ authenticationTokenRegistry, authenticationExtractor }))
const userDomainEventHandlers = new UserDomainEventHandlers({ emailRegistry, eventBus })
userDomainEventHandlers.activate()

const userReadModelStorage = new InMemoryIndexedStorage({ indexes: ['email'] })
const userReadModelSynchronization = new UserReadModelSynchronization({ userReadModelStorage, eventBus })
userReadModelSynchronization.activate()
const userQueryHandlers = new UserQueryHandlers({ userReadModelStorage })

const randomSurffix = `${Date.now()}`
const userId = generateId(),
  adminUserId = generateId(),
  systemUserId = generateId()
const userEmail = `jd$${randomSurffix}@example.com`
const userEmail2 = `john-doe$${randomSurffix}@example.com`
const adminEmail = `admin$${randomSurffix}@example.com`
const authenticationMetadata = {
  system: { subjectId: systemUserId, token: generateId() },
  admin: { subjectId: adminUserId, token: generateId() },
}

await authenticationTokenRegistry.assignToken(authenticationMetadata.system.subjectId, authenticationMetadata.system.token)
await accessRegistry.grantFullAccess(systemUserId)
;(await userRepository.loadAll()).forEach((user) => emailRegistry.setUserEmail(user.id, user.email))

await userCommandHandlers.handleCommand(
  new CreateUserCommand({
    data: { userId: adminUserId, username: 'admin', role: 'admin', password: 'pw1', email: adminEmail },
    metadata: { authentication: authenticationMetadata.system },
  })
)
await userCommandHandlers.handleCommand(
  new LoginUserCommand({
    data: {
      userId: adminUserId,
      password: 'pw1',
      authenticationToken: authenticationMetadata.admin.token,
    },
  })
)
await userCommandHandlers.handleCommand(
  new CreateUserCommand({
    data: { userId, username: 'johndoe', role: 'user', password: 'pw2', email: userEmail },
    metadata: { authentication: authenticationMetadata.admin },
  })
)
await userCommandHandlers.handleCommand(
  new UpdateUserEmailCommand({
    data: { userId, email: userEmail2 },
    metadata: { authentication: authenticationMetadata.admin },
  })
)
await timeout(100)
console.log(await userQueryHandlers.handleQuery(new FindUserByEmailQuery({ data: { email: userEmail2 } })))
