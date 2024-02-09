import http from 'http'
import * as eventTypeFactory from '../../shared/domain/eventTypeFactory.mjs'
import { AccessRegistry } from '../../shared/infrastructure/AccessRegistry.mjs'
import { createHttpInterface } from '../../shared/infrastructure/http.mjs'
import { TaskBoardCommandHandlers } from './application/TaskBoardCommandHandlers.mjs'
import { TaskBoardRepository } from './infrastructure/TaskBoardRepository.mjs'
import { TaskRepository } from './infrastructure/TaskRepository.mjs'
import { DomainEventPublisher } from '../../shared/infrastructure/DomainEventPublisher.mjs'
import { EventBus } from '../../shared/infrastructure/eventBus.mjs'
import { FilesystemMessageBus } from '../../shared/infrastructure/FilesystemMessageBus.mjs'
import { generateId } from '../../shared/infrastructure/id.mjs'
import { TaskBoardDomainEventHandlers } from './application/TaskBoardDomainEventHandlers.mjs'
import { InMemoryIndexedStorage } from '../../shared/infrastructure/persistence/InMemoryIndexedStorage.mjs'

eventTypeFactory.setIdGenerator(generateId)
eventTypeFactory.setMetadataProvider(() => ({ creationTime: new Date() }))

const rootDirectory = process.env.ROOT_STORAGE_DIR || './data'

const eventBus = new EventBus(
  new FilesystemMessageBus({ storageDirectory: `${rootDirectory}/message-bus`, subscriberGroup: 'task-board' })
)
const accessRegistry = new AccessRegistry({ storageDirectory: `${rootDirectory}/access` })
const taskRepository = new TaskRepository({ storageDirectory: `${rootDirectory}/task` })
const taskBoardRepository = new TaskBoardRepository({ storageDirectory: `${rootDirectory}/task-board` })
const taskAssigneeReadModelStorage = new InMemoryIndexedStorage({ indexes: ['assigneeId'] })
new DomainEventPublisher({
  repository: taskRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootDirectory}/task/published-event-ids`,
}).activate()
new DomainEventPublisher({
  repository: taskBoardRepository,
  eventBus,
  publishedEventIdsDirectory: `${rootDirectory}/task-board/published-event-ids`,
}).activate()
new TaskBoardDomainEventHandlers({
  taskAssigneeReadModelStorage,
  taskRepository,
  taskBoardRepository,
  accessRegistry,
  eventBus,
}).activate()
const commandHandlers = new TaskBoardCommandHandlers({
  accessRegistry,
  taskRepository,
  taskBoardRepository,
})

const httpInterface = createHttpInterface((message) => commandHandlers.handleCommand(message), ['POST'])
const PORT = process.env.PORT || 8080
http.createServer(httpInterface).listen(PORT)
console.log(`Taskboard write-side is listening on ${PORT}`)
