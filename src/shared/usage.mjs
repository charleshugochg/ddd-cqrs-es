import http from 'http'
import url from 'url'
import { createHttpProxy, get } from './infrastructure/http.mjs'

http.createServer((_, response) => response.end('response from the write side')).listen(5001)
http.createServer((_, response) => response.end('response from the read side')).listen(5002)

const httpProxy = createHttpProxy((request) => {
  const { pathname } = url.parse(request.url)
  return `http://localhost:${pathname.substr(1) === 'write-side' ? 5001 : 5002}`
})

http.createServer(httpProxy).listen(5000)

console.log(await get('http://localhost:5000/write-side'))
console.log(await get('http://localhost:5000/read-side'))
