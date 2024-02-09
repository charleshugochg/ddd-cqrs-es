import http from 'http'
import { InMemoryIndexedStorage } from '../../shared/infrastructure/persistence/InMemoryIndexedStorage.mjs'
import { ProjectQueryHandlers } from './application/ProjectQueryHandlers.mjs'
import { EventBus } from '../../shared/infrastructure/eventBus.mjs'
import { FilesystemMessageBus } from '../../shared/infrastructure/FilesystemMessageBus.mjs'
import { ProjectReadModelSynchronization } from './application/ProjectReadModelSynchronization.mjs'
import { createHttpInterface } from '../../shared/infrastructure/http.mjs'

const rootStorageDirectory = process.env.ROOT_STORAGE_DIR || './data'

const eventBus = new EventBus(
  new FilesystemMessageBus({ storageDirectory: `${rootStorageDirectory}/message-bus`, subscriberGroup: 'project' })
)
const projectReadModelStorage = new InMemoryIndexedStorage({ indexes: ['ownerId', 'teamId'] })
const teamMemberReadModelStorage = new InMemoryIndexedStorage({ indexes: ['userId'] })

new ProjectReadModelSynchronization({ projectReadModelStorage, teamMemberReadModelStorage, eventBus }).activate()

const queryHandlers = new ProjectQueryHandlers({ projectReadModelStorage, teamMemberReadModelStorage })

const httpInterface = createHttpInterface((message) => queryHandlers.handleQuery(message), ['GET'])
const PORT = process.env.PORT || 8080
http.createServer(httpInterface).listen(PORT)
console.log(`Project read-side is listening on ${PORT}`)
