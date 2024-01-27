import { verify } from '../../../shared/domain/verify.mjs'

export class Role {
  constructor(name) {
    verify('valid role', typeof name == 'string' && !!name)
    Object.freeze(Object.assign(this, { name }))
  }

  equals(role) {
    return this.name === role.name
  }
}
