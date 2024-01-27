import { Project } from './Project.mjs'

export class ProjectFactory {
  createProject({ id, name, ownerId, teamId, taskBoardId }) {
    return new Project({ id, name, ownerId, teamId, taskBoardId, isExistingProject: false })
  }

  reconstituteProject({ id, name, ownerId, teamId, taskBoardId }) {
    return new Project({ id, name, ownerId, teamId, taskBoardId, isExistingProject: true })
  }
}
