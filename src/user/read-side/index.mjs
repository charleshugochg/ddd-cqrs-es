import http from 'http'
import { createHttpInterface } from '../../shared/infrastructure/http.mjs'
import { InMemoryIndexedStorage } from '../../shared/infrastructure/persistence/InMemoryIndexedStorage.mjs'
import { UserQueryHandlers } from './application/UserQueryHandlers.mjs'
import { UserReadModelSynchronization } from './application/UserReadModelSynchronization.mjs'
import { EventBus } from '../../shared/infrastructure/eventBus.mjs'
import { FilesystemMessageBus } from '../../shared/infrastructure/FilesystemMessageBus.mjs'

const rootDirectory = process.env.ROOT_STORAGE_DIR || './data'
const storageDirectory = `${rootDirectory}/message-bus`
const eventBus = new EventBus(new FilesystemMessageBus({ storageDirectory, subscriberGroup: 'user' }))
const userReadModelStorage = new InMemoryIndexedStorage({ indexes: ['email'] })
new UserReadModelSynchronization({ userReadModelStorage, eventBus }).activate()
const userQueryHandlers = new UserQueryHandlers({ userReadModelStorage })

const httpInterface = createHttpInterface((message) => userQueryHandlers.handleQuery(message), ['GET'])

const PORT = process.env.PORT || 8080
http.createServer(httpInterface).listen(PORT)
console.log(`User read-side server is listening on ${PORT}`)
