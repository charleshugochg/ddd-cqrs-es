import { verify } from '../../../shared/domain/verify.mjs'

const validRoles = ['user', 'admin']

export class Role {
  name

  constructor(name) {
    verify('role name', validRoles.includes(name))
    Object.freeze(Object.assign(this, { name }))
  }

  equals(role) {
    return this.name === role.name
  }
}
