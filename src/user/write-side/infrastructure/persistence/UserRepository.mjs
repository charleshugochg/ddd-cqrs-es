import { ConcurrencySafeFilesystemRepository } from '../../../../shared/infrastructure/persistence/ConcurrencySafeFilesystemRepository.mjs'
import { Email } from '../../domain/Email.mjs'
import { Role } from '../../domain/Role.mjs'

export class UserRepository extends ConcurrencySafeFilesystemRepository {
  constructor({ storageDirectory, userFactory }) {
    super({
      storageDirectory,
      convertToData: ({ id, username, email, password, role }) => ({
        id,
        username,
        email: email.value,
        password,
        role: role.name,
      }),
      convertToEntity: ({ id, username, email, password, role }) =>
        userFactory.reconstituteUser({ id, username, password, email: new Email(email), role: new Role(role) }),
    })
  }
}
