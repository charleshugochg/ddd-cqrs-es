import http from 'http'
import * as eventTypeFactory from '../../shared/domain/eventTypeFactory.mjs'
import { AccessRegistry } from '../../shared/infrastructure/AccessRegistry.mjs'
import { AuthenticationTokenRegistry } from '../../shared/infrastructure/AuthenticationTokenRegistry.mjs'
import { DomainEventPublisher } from '../../shared/infrastructure/DomainEventPublisher.mjs'
import { FilesystemMessageBus } from '../../shared/infrastructure/FilesystemMessageBus.mjs'
import { MiddlewareProxy } from '../../shared/infrastructure/MiddlewareProxy.mjs'
import { createAuthenticationMiddleware } from '../../shared/infrastructure/authenticationMiddlewareFactory.mjs'
import { EventBus } from '../../shared/infrastructure/eventBus.mjs'
import { createMd5Hash } from '../../shared/infrastructure/hash.mjs'
import { createHttpInterface } from '../../shared/infrastructure/http.mjs'
import { generateId } from '../../shared/infrastructure/id.mjs'
import { UserCommandHandlers } from './application/UserCommandHandlers.mjs'
import { UserDomainEventHandlers } from './application/UserDomainEventHandlers.mjs'
import { EmailRegistry } from './domain/EmailRegistry.mjs'
import { UserFactory } from './domain/UserFactory.mjs'
import { UserRepository } from './infrastructure/persistence/UserRepository.mjs'

eventTypeFactory.setIdGenerator(generateId)
eventTypeFactory.setMetadataProvider(() => ({ creationTime: new Date() }))

const rootDirectory = process.env.ROOT_STORAGE_DIR || './data'
const storageDirectory = `${rootDirectory}/user`
const tokenStorageDirectory = `${rootDirectory}/token`
const accessStorageDirectory = `${rootDirectory}/access`
const messageStorageDirectory = `${rootDirectory}/message-bus`

const eventBus = new EventBus(
  new FilesystemMessageBus({ storageDirectory: messageStorageDirectory, subscriberGroup: 'user' })
)
const emailRegistry = new EmailRegistry()
const userFactory = new UserFactory({ emailRegistry })
const userRepository = new UserRepository({ storageDirectory, userFactory })
const authenticationTokenRegistry = new AuthenticationTokenRegistry({ storageDirectory: tokenStorageDirectory })
const accessRegistry = new AccessRegistry({ storageDirectory: accessStorageDirectory })
const commandHandlers = new UserCommandHandlers({
  userRepository,
  userFactory,
  hashPassword: createMd5Hash,
  authenticationTokenRegistry,
  accessRegistry,
})
const domainEventPublisher = new DomainEventPublisher({
  repository: userRepository,
  eventBus,
  publishedEventIdsDirectory: `${storageDirectory}/published-event-ids`,
})
domainEventPublisher.activate()
const userDomainEventHandlers = new UserDomainEventHandlers({ emailRegistry, eventBus })
userDomainEventHandlers.activate()

const httpInterface = createHttpInterface((message) => commandHandlers.handleCommand(message), ['POST'])
const PORT = process.env.PORT || 8080
http.createServer(httpInterface).listen(PORT)
console.log(`User write-side server is listening on ${PORT}`)
