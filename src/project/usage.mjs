import * as eventTypeFactory from '../shared/domain/eventTypeFactory.mjs'
import * as messageTypeFactory from '../shared/domain/messageTypeFactory.mjs'
import { AccessRegistry } from '../shared/infrastructure/AccessRegistry.mjs'
import { AuthenticationTokenRegistry } from '../shared/infrastructure/AuthenticationTokenRegistry.mjs'
import { DomainEventPublisher } from '../shared/infrastructure/DomainEventPublisher.mjs'
import { MiddlewareProxy } from '../shared/infrastructure/MiddlewareProxy.mjs'
import { createAuthenticationMiddleware } from '../shared/infrastructure/authenticationMiddlewareFactory.mjs'
import { EventBus } from '../shared/infrastructure/eventBus.mjs'
import { generateId } from '../shared/infrastructure/id.mjs'
import { InMemoryIndexedStorage } from '../shared/infrastructure/persistence/InMemoryIndexedStorage.mjs'
import { timeout } from '../shared/infrastructure/timeout.mjs'
import { ProjectQueryHandlers } from './read-side/application/ProjectQueryHandlers.mjs'
import { ProjectReadModelSynchronization } from './read-side/application/ProjectReadModelSynchronization.mjs'
import { FindProjectsByCollaboratingUserQuery, FindProjectsByOwnerQuery } from './read-side/application/queries.mjs'
import { ProjectCommandHandlers } from './write-side/application/ProjectCommandHandlers.mjs'
import { ProjectDomainEventHandlers } from './write-side/application/ProjectDomainEventHandlers.mjs'
import {
  AddTeamMemberToTeamCommand,
  CreateProjectCommand,
  UpdateProjectNameCommand,
} from './write-side/application/commands.mjs'
import { ProjectFactory } from './write-side/domain/ProjectFactory.mjs'
import { TeamMemberFactory } from './write-side/domain/TeamMemberFactory.mjs'
import { ProjectRepository } from './write-side/infrastructure/persistence/ProjectRepository.mjs'
import { TeamMemberRepository } from './write-side/infrastructure/persistence/TeamMemberRepository.mjs'
import { TeamRepository } from './write-side/infrastructure/persistence/TeamRepository.mjs'

eventTypeFactory.setIdGenerator(generateId)
messageTypeFactory.setIdGenerator(generateId)

const rootStorageDirectory = './data'
const eventBus = new EventBus()

const teamMemberFactory = new TeamMemberFactory()
const teamMemberRepository = new TeamMemberRepository({
  storageDirectory: `${rootStorageDirectory}/team-member`,
  teamMemberFactory,
})
const teamRepository = new TeamRepository({ storageDirectory: `${rootStorageDirectory}/team` })
const projectFactory = new ProjectFactory()
const projectRepository = new ProjectRepository({ storageDirectory: `${rootStorageDirectory}/project`, projectFactory })
const authenticationTokenRegistry = new AuthenticationTokenRegistry({ storageDirectory: `${rootStorageDirectory}/token` })
const accessRegistry = new AccessRegistry({ storageDirectory: `${rootStorageDirectory}/access` })
const projectReadModelStorage = new InMemoryIndexedStorage({ indexes: ['ownerId', 'teamId'] })
const teamMemberReadModelStorage = new InMemoryIndexedStorage({ indexes: ['userId'] })

const teamEventPublisher = new DomainEventPublisher({
  repository: teamRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/team/published-event-ids`,
})
const teamMemberEventPublisher = new DomainEventPublisher({
  repository: teamMemberRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/team-member/published-event-ids`,
})
const projectEventPublisher = new DomainEventPublisher({
  repository: projectRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/project/published-event-ids`,
})
teamEventPublisher.activate()
teamMemberEventPublisher.activate()
projectEventPublisher.activate()

const projectCommandHandlers = new MiddlewareProxy(
  new ProjectCommandHandlers({ accessRegistry, projectRepository, projectFactory, teamRepository, teamMemberRepository })
)
const authenticationExtractor = ({ metadata }) => metadata.authentication
projectCommandHandlers.addMiddleware(
  createAuthenticationMiddleware({ authenticationTokenRegistry, authenticationExtractor })
)
const projectQueryHandlers = new ProjectQueryHandlers({ projectReadModelStorage, teamMemberReadModelStorage })
const projectDomainEventHandlers = new ProjectDomainEventHandlers({ teamRepository, accessRegistry, eventBus })
projectDomainEventHandlers.activate()

const projectReadModelSynchronization = new ProjectReadModelSynchronization({
  projectReadModelStorage,
  teamMemberReadModelStorage,
  eventBus,
})
projectReadModelSynchronization.activate()

const [projectId, teamId, userId, teamMemberId, taskBoardId, adminId] = [
  generateId(),
  generateId(),
  generateId(),
  generateId(),
  generateId(),
  generateId(),
]
const authenticationMetadata = {
  user: { subjectId: userId, token: generateId() },
  admin: { subjectId: adminId, token: generateId() },
}

await authenticationTokenRegistry.assignToken(authenticationMetadata.user.subjectId, authenticationMetadata.user.token)
await authenticationTokenRegistry.assignToken(authenticationMetadata.admin.subjectId, authenticationMetadata.admin.token)
await accessRegistry.grantFullAccess(adminId)

projectCommandHandlers.handleCommand(
  new CreateProjectCommand({
    data: { projectId, name: 'Test Project', ownerId: userId, teamId, taskBoardId },
    metadata: { authentication: authenticationMetadata.admin },
  })
)
await timeout(100)
projectCommandHandlers.handleCommand(
  new AddTeamMemberToTeamCommand({
    data: { teamId, teamMemberId, userId, role: 'developer' },
    metadata: { authentication: authenticationMetadata.admin },
  })
)
projectCommandHandlers.handleCommand(
  new UpdateProjectNameCommand({
    data: { projectId, name: 'Test Project v2' },
    metadata: { authentication: authenticationMetadata.admin },
  })
)
await timeout(100)
console.log(await projectQueryHandlers.handleQuery(new FindProjectsByOwnerQuery({ data: { userId } })))
console.log(await projectQueryHandlers.handleQuery(new FindProjectsByCollaboratingUserQuery({ data: { userId } })))
