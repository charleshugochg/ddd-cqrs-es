import http from 'http'
import * as eventTypeFactory from '../../shared/domain/eventTypeFactory.mjs'
import { AccessRegistry } from '../../shared/infrastructure/AccessRegistry.mjs'
import { DomainEventPublisher } from '../../shared/infrastructure/DomainEventPublisher.mjs'
import { FilesystemMessageBus } from '../../shared/infrastructure/FilesystemMessageBus.mjs'
import { EventBus } from '../../shared/infrastructure/eventBus.mjs'
import { createHttpInterface } from '../../shared/infrastructure/http.mjs'
import { generateId } from '../../shared/infrastructure/id.mjs'
import { ProjectCommandHandlers } from './application/ProjectCommandHandlers.mjs'
import { ProjectFactory } from './domain/ProjectFactory.mjs'
import { TeamMemberFactory } from './domain/TeamMemberFactory.mjs'
import { ProjectRepository } from './infrastructure/persistence/ProjectRepository.mjs'
import { TeamMemberRepository } from './infrastructure/persistence/TeamMemberRepository.mjs'
import { TeamRepository } from './infrastructure/persistence/TeamRepository.mjs'
import { ProjectDomainEventHandlers } from './application/ProjectDomainEventHandlers.mjs'

eventTypeFactory.setIdGenerator(generateId)
eventTypeFactory.setMetadataProvider(() => ({ creationTime: new Date() }))

const rootStorageDirectory = process.env.ROOT_STORAGE_DIR || './data'
const eventBus = new EventBus(
  new FilesystemMessageBus({ storageDirectory: `${rootStorageDirectory}/message-bus`, subscriberGroup: 'project' })
)
const accessRegistry = new AccessRegistry({ storageDirectory: `${rootStorageDirectory}/access` })
const teamMemberFactory = new TeamMemberFactory()
const teamMemberRepository = new TeamMemberRepository({
  storageDirectory: `${rootStorageDirectory}/team-member`,
  teamMemberFactory,
})
const teamRepository = new TeamRepository({ storageDirectory: `${rootStorageDirectory}/team` })
const projectFactory = new ProjectFactory()
const projectRepository = new ProjectRepository({ storageDirectory: `${rootStorageDirectory}/project`, projectFactory })
new DomainEventPublisher({
  repository: teamRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/team/published-event-ids`,
}).activate()
new DomainEventPublisher({
  repository: teamMemberRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/team-member/published-event-ids`,
}).activate()
new DomainEventPublisher({
  repository: projectRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/project/published-event-ids`,
}).activate()
new ProjectDomainEventHandlers({ teamRepository, accessRegistry, eventBus }).activate()

const projectCommandHandlers = new ProjectCommandHandlers({
  accessRegistry,
  projectRepository,
  projectFactory,
  teamRepository,
  teamMemberRepository,
})

const httpInterface = createHttpInterface((message) => projectCommandHandlers.handleCommand(message), ['POST'])
const PORT = process.env.PORT || 8080
http.createServer(httpInterface).listen(PORT)
console.log(`Project write-side is listening on ${PORT}`)
