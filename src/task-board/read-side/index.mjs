import http from 'http'
import { createHttpInterface } from '../../shared/infrastructure/http.mjs'
import { InMemoryIndexedStorage } from '../../shared/infrastructure/persistence/InMemoryIndexedStorage.mjs'
import { TaskBoardQueryHandlers } from './application/TaskBoardQueryHandlers.mjs'
import { TaskBoardReadModelSynchronization } from './application/TaskBoardReadModelSynchronization.mjs'
import { EventBus } from '../../shared/infrastructure/eventBus.mjs'
import { FilesystemMessageBus } from '../../shared/infrastructure/FilesystemMessageBus.mjs'

const rootDirectory = process.env.ROOT_STORAGE_DIR || './data'

const eventBus = new EventBus(
  new FilesystemMessageBus({ storageDirectory: `${rootDirectory}/message-bus`, subscriberGroup: 'task-board' })
)
const taskReadModelStorage = new InMemoryIndexedStorage({ indexes: ['taskBoardId'] })
new TaskBoardReadModelSynchronization({ taskReadModelStorage, eventBus }).activate()
const queryHandlers = new TaskBoardQueryHandlers({ taskReadModelStorage })

const httpInterface = createHttpInterface((message) => queryHandlers.handleQuery(message), ['GET'])
const PORT = process.env.PORT || 8080
http.createServer(httpInterface).listen(PORT)
console.log(`Taskboard read-side is listening on ${PORT}`)
