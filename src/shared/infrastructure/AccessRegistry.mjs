import { mkdirSync } from 'fs'
import { access, mkdir, rmdir, symlink, unlink, writeFile } from 'fs/promises'
import path from 'path'

export class AccessRegistry {
  #storageDirectory

  constructor({ storageDirectory }) {
    this.#storageDirectory = storageDirectory
    mkdirSync(this.#storageDirectory, { recursive: true })
  }

  async grantFullAccess(subjectId) {
    return await this.grantAccess(subjectId, 'full-access')
  }

  async grantAccess(subjectId, accessPath) {
    const accessDirectory = this.#convertToDirectory(accessPath)
    await mkdir(accessDirectory, { recursive: true })
    await writeFile(`${accessDirectory}/${subjectId}`, '')
  }

  async grantImplicitAccess(originalAccessPath, implicitAccessPath) {
    const originalDirectory = this.#convertToDirectory(originalAccessPath)
    const implicitDirectory = this.#convertToDirectory(implicitAccessPath)
    const implecitDirectoryParent = path.join(implicitDirectory, '../')
    await Promise.all([mkdir(originalDirectory, { recursive: true }), mkdir(implecitDirectoryParent, { recursive: true })])
    await symlink(path.resolve(originalDirectory), implicitDirectory)
  }

  async revokeImplicitAccess(implicitAccessPath) {
    const symlinkDirectory = this.#convertToDirectory(implicitAccessPath)
    await rmdir(symlinkDirectory)
  }

  async verifyAccess(subjectId, accessPath) {
    const fullAccessDirectory = this.#convertToDirectory('full-access')
    await access(`${fullAccessDirectory}/${subjectId}`)
      .catch(() => access(`${this.#convertToDirectory(accessPath)}/${subjectId}`))
      .catch(() => {
        throw new Error('access denied')
      })
  }

  async revokeAccess(subjectId, accessPath) {
    const accessDirectory = this.#convertToDirectory(accessPath)
    await unlink(`${accessDirectory}/${subjectId}`)
  }

  #convertToDirectory(accessPath) {
    this.#verifyAccessPath(accessPath)
    return `${this.#storageDirectory}/${accessPath}`
  }

  #verifyAccessPath(accessPath) {
    return /[^a-zA-Z0-9/-]/gi.test(accessPath)
  }
}
