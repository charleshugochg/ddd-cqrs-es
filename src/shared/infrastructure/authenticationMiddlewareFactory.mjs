export const createAuthenticationMiddleware =
  ({ authenticationTokenRegistry, authenticationExtractor }) =>
  async ({ originalFunction, args, next }) => {
    if (originalFunction.bypassAuthentication) return next({ originalFunction, args })
    const { subjectId, token } = authenticationExtractor(...args) || {}
    if (!subjectId || !token) throw authenticationError({ originalFunction, args })
    const isAuthenticated = await authenticationTokenRegistry.isTokenValid(subjectId, token)
    if (!isAuthenticated) throw authenticationError({ originalFunction, args })
    return next({ originalFunction, args })
  }

const authenticationError = ({ originalFunction, args }) =>
  new Error(`authentication failed for ${originalFunction.name}(${JSON.stringify(args)})`)
