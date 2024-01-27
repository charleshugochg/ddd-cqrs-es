import { verify } from '../../../shared/domain/verify.mjs'

export class EmailRegistry {
  #emailsByUser = new Map()

  setUserEmail(userId, email) {
    verify('email in use', this.isEmailAvailable(email))
    this.#emailsByUser.set(userId, email)
  }

  getUserEmail(userId) {
    return this.#emailsByUser.get(userId)
  }

  isEmailAvailable(email) {
    const usedEmails = Array.from(this.#emailsByUser.values())
    return !usedEmails.some((usedEmail) => usedEmail.equals(email))
  }
}
