export const MiddlewareProxy = function (target) {
  const executeOriginal = ({ originalFunction, args }) => originalFunction.apply(target, args)

  let middlewareChain = executeOriginal

  const get = (target, property) => {
    if (property === 'addMiddleware') return addMiddleware
    const value = target[property]
    if (typeof value != 'function') return value
    return (...args) => middlewareChain({ originalFunction: value, args })
  }

  const addMiddleware = (middleware) => {
    const next = middlewareChain
    middlewareChain = ({ originalFunction, args }) => middleware({ originalFunction, args, next })
  }

  return new Proxy(target, { get })
}
