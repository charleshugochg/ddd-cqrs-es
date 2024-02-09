import { FindProjectsByCollaboratingUserQuery } from './project/read-side/application/queries.mjs'
import { AddTeamMemberToTeamCommand, CreateProjectCommand } from './project/write-side/application/commands.mjs'
import * as messageTypeFactory from './shared/application/messageTypeFactory.mjs'
import { get, post } from './shared/infrastructure/http.mjs'
import { generateId } from './shared/infrastructure/id.mjs'
import { timeout } from './shared/infrastructure/timeout.mjs'
import { FindTasksOnTaskBoardQuery } from './task-board/read-side/application/queries.mjs'
import { AddNewTaskToTaskBoardCommand, UpdateTaskAssigneeCommand } from './task-board/write-side/application/commands.mjs'
import { FindUserByEmailQuery } from './user/read-side/application/queries.mjs'
import { CreateUserCommand } from './user/write-side/application/commands.mjs'

messageTypeFactory.setIdGenerator(generateId)
messageTypeFactory.setDefaultMetadataProvider(() => ({ creationTime: new Date() }))

await import('./index.mjs')

const userId = generateId(),
  projectId = generateId(),
  teamId = generateId(),
  teamMemberId = generateId(),
  taskBoardId = generateId(),
  taskId = generateId()
const email = `john$${generateId()}@email.com`

await timeout(1000)

console.log(
  await post(
    'localhost:5000/user',
    new CreateUserCommand({
      data: { userId, username: 'john', email, password: 'pw1', role: 'user' },
    })
  )
)
console.log(
  await post(
    'localhost:5000/project',
    new CreateProjectCommand({
      data: { projectId, name: 'Test', ownerId: userId, teamId, taskBoardId },
    })
  )
)
await timeout(100)
console.log(
  await post(
    'localhost:5000/project',
    new AddTeamMemberToTeamCommand({
      data: { teamId, teamMemberId, userId, role: 'developer' },
    })
  )
)
await timeout(100)
console.log(
  await post(
    'localhost:5000/task-board',
    new AddNewTaskToTaskBoardCommand({
      data: { taskBoardId, taskId, title: 'tests', description: 'write unit tests' },
    })
  )
)
await timeout(100)
console.log(
  await post(
    'localhost:5000/task-board',
    new UpdateTaskAssigneeCommand({
      data: { taskId, assigneeId: teamMemberId },
    })
  )
)
await timeout(100)

console.log(
  JSON.parse(
    await get(
      'localhost:5000/user',
      new FindUserByEmailQuery({
        data: { email },
      })
    )
  )
)
console.log(
  JSON.parse(
    await get(
      'localhost:5000/project',
      new FindProjectsByCollaboratingUserQuery({
        data: { userId },
      })
    )
  )
)
console.log(
  JSON.parse(
    await get(
      'localhost:5000/task-board',
      new FindTasksOnTaskBoardQuery({
        data: { taskBoardId },
      })
    )
  )
)
