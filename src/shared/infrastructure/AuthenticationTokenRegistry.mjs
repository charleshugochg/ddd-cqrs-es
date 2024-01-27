import { mkdirSync } from 'fs'
import { access, unlink, writeFile } from 'fs/promises'

export class AuthenticationTokenRegistry {
  #storageDirectory

  constructor({ storageDirectory }) {
    this.#storageDirectory = storageDirectory
    mkdirSync(this.#storageDirectory, { recursive: true })
  }

  async assignToken(subjectId, token) {
    await writeFile(this.#getFilePath(subjectId, token), '')
  }

  async isTokenValid(subjectId, token) {
    return await access(this.#getFilePath(subjectId, token))
      .then(() => true)
      .catch(() => false)
  }

  async removeToken(subjectId, token) {
    return await unlink(this.#getFilePath(subjectId, token))
  }

  #getFilePath(subjectId, token) {
    return `${this.#storageDirectory}/${subjectId}.${token}`
  }
}
