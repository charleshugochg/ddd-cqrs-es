import { verify } from '../../../shared/domain/verify.mjs'

const emailRegex = /^[^ @]+@[^ .]+\.[^ .]+$/

export class Email {
  constructor(value) {
    verify('invalid email', emailRegex.test(value))
    Object.freeze(Object.assign(this, { value }))
  }

  equals(email) {
    return this.value === email.value
  }
}
