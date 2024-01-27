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
import { TaskBoardQueryHandlers } from './read-side/application/TaskBoardQueryHandlers.mjs'
import { TaskBoardReadModelSynchronization } from './read-side/application/TaskBoardReadModelSynchronization.mjs'
import { FindTasksOnTaskBoardQuery } from './read-side/application/queries.mjs'
import { TaskBoardCommandHandlers } from './write-side/application/TaskBoardCommandHandlers.mjs'
import { TaskBoardDomainEventHandlers } from './write-side/application/TaskBoardDomainEventHandlers.mjs'
import {
  AddNewTaskToTaskBoardCommand,
  UpdateTaskAssigneeCommand,
  UpdateTaskStatusCommand,
} from './write-side/application/commands.mjs'
import { TaskBoardRepository } from './write-side/infrastructure/TaskBoardRepository.mjs'
import { TaskRepository } from './write-side/infrastructure/TaskRepository.mjs'

eventTypeFactory.setIdGenerator(generateId)
messageTypeFactory.setIdGenerator(generateId)
const rootStorageDirectory = './data'
const eventBus = new EventBus()
const taskRepository = new TaskRepository({ storageDirectory: `${rootStorageDirectory}/task` })
const taskBoardRepository = new TaskBoardRepository({ storageDirectory: `${rootStorageDirectory}/task-board` })
const taskAssigneeReadModelStorage = new InMemoryIndexedStorage({ indexes: ['assigneeId'] })
const authenticationTokenRegistry = new AuthenticationTokenRegistry({ storageDirectory: `${rootStorageDirectory}/token` })
const accessRegistry = new AccessRegistry({ storageDirectory: `${rootStorageDirectory}/access` })

const taskEventPublisher = new DomainEventPublisher({
  repository: taskRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/task/published-event-ids`,
})
const taskBoardEventPublisher = new DomainEventPublisher({
  repository: taskBoardRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootStorageDirectory}/task-board/published-event-ids`,
})
taskEventPublisher.activate()
taskBoardEventPublisher.activate()

const taskBoardCommandHandlers = new MiddlewareProxy(
  new TaskBoardCommandHandlers({ accessRegistry, taskRepository, taskBoardRepository })
)
const authenticationExtractor = ({ metadata }) => metadata.authentication
taskBoardCommandHandlers.addMiddleware(
  createAuthenticationMiddleware({ authenticationTokenRegistry, authenticationExtractor })
)
const taskBoardDomainEventHandlers = new TaskBoardDomainEventHandlers({
  taskAssigneeReadModelStorage,
  taskRepository,
  taskBoardRepository,
  accessRegistry,
  eventBus,
})
taskBoardDomainEventHandlers.activate()

const taskReadModelStorage = new InMemoryIndexedStorage({ indexes: ['taskBoardId'] })
const taskBoardQueryHandlers = new TaskBoardQueryHandlers({ taskReadModelStorage })
const taskBoardReadModelSynchronization = new TaskBoardReadModelSynchronization({ taskReadModelStorage, eventBus })
taskBoardReadModelSynchronization.activate()

const [taskBoardId, taskId, teamId, adminUserId, assigneeId] = [
  generateId(),
  generateId(),
  generateId(),
  generateId(),
  generateId(),
]
const authenticationMetadata = { subjectId: adminUserId, token: generateId() }

await authenticationTokenRegistry.assignToken(authenticationMetadata.subjectId, authenticationMetadata.token)
await accessRegistry.grantFullAccess(adminUserId)

eventBus.publish({ type: 'ProjectCreated', data: { taskBoardId, teamId } })
await timeout(100)
await taskBoardCommandHandlers.handleCommand(
  new AddNewTaskToTaskBoardCommand({
    data: {
      taskId,
      taskBoardId,
      title: 'write tests',
      description: 'write unit tests for new feature',
    },
    metadata: { authentication: authenticationMetadata },
  })
)
await timeout(100)
await taskBoardCommandHandlers.handleCommand(
  new UpdateTaskAssigneeCommand({
    data: { taskId, assigneeId },
    metadata: { authentication: authenticationMetadata },
  })
)
await timeout(100)
await taskBoardCommandHandlers.handleCommand(
  new UpdateTaskStatusCommand({
    data: { taskId, status: 'in progress' },
    metadata: { authentication: authenticationMetadata },
  })
)
await timeout(100)
console.log(await taskBoardQueryHandlers.handleQuery(new FindTasksOnTaskBoardQuery({ data: { taskBoardId } })))
eventBus.publish({ type: 'TeamMemberRemovedFromTeam', data: { teamId, teamMemberId: assigneeId } })
await timeout(100)
console.log(await taskBoardQueryHandlers.handleQuery(new FindTasksOnTaskBoardQuery({ data: { taskBoardId } })))
