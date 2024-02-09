import { parse } from 'url'
import http from 'http'

const createQueryString = (queryParameters) =>
  Object.entries(queryParameters)
    .map(([key, value]) =>
      typeof value == 'object'
        ? Object.entries(value).map(([subKey, value]) => `${key}.${subKey}=${value}`)
        : `${key}=${value}`
    )
    .flat(Infinity)
    .join('&')

const parseQueryString = (url) => {
  const parsedQuery = parse(url, true).query
  const parsedQueryWithNesting = {}
  Object.entries(parsedQuery).forEach(([keys, value]) => {
    const [key, nestedKey] = keys.split('.')
    if (!nestedKey) parsedQueryWithNesting[key] = value
    else {
      parsedQueryWithNesting[key] = parsedQueryWithNesting[key] || {}
      parsedQueryWithNesting[key][nestedKey] = value
    }
  })
  return parsedQueryWithNesting
}

const parseHttpStream = (stream) =>
  new Promise((resolve) => {
    let result = ''
    stream.on('data', (chunk) => (result += chunk.toString()))
    stream.on('end', () => resolve(result))
  })

export const createHttpInterface =
  (targetFunction, methods = []) =>
  async (request, response) => {
    try {
      if (!methods.includes(request.method)) throw new Error('invalid method')
      const message =
        request.method === 'POST' ? JSON.parse(await parseHttpStream(request)) : parseQueryString(request.url)
      const result = await targetFunction(message)
      response.writeHead(200, { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' })
      response.end(result != null ? JSON.stringify(result) : result)
    } catch (error) {
      response.writeHead(500)
      response.end(error.toString())
    }
  }

export const createHttpProxy = (urlResolver) => async (request, response) => {
  const targetUrl = await urlResolver(request)
  if (!targetUrl) {
    response.writeHead(404)
    response.end()
    return
  }
  const forwardingRequest = http.request(
    targetUrl,
    {
      method: request.method,
      headers: request.headers,
    },
    (actualResponse) => {
      response.writeHead(actualResponse.statusCode, actualResponse.headers)
      actualResponse.pipe(response)
    }
  )
  request.pipe(forwardingRequest)
}

export const post = (url, data) =>
  new Promise((resolve) => {
    http
      .request(urlWithProtocol(url), { method: 'POST' }, (response) => {
        parseHttpStream(response).then(resolve)
      })
      .end(JSON.stringify(data))
  })

export const get = (url, queryParameters = {}) =>
  new Promise((resolve) => {
    const queryString = createQueryString(queryParameters)
    http.get(`${urlWithProtocol(url)}?${queryString}`, (response) => parseHttpStream(response).then(resolve))
  })

const urlWithProtocol = (url) => (url.indexOf('http') === 0 ? url : `http://${url}`)
