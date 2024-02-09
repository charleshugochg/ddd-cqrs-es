import { spawn } from 'child_process'
import http from 'http'
import path from 'path'
import { parse } from 'url'
import { createHttpProxy } from './shared/infrastructure/http.mjs'

const rootDirectory = './src'
const ROOT_STORAGE_DIR = './data'
const programMappings = {
  'user/write-side': 5001,
  'user/read-side': 5002,
  'task-board/write-side': 5003,
  'task-board/read-side': 5004,
  'project/write-side': 5005,
  'project/read-side': 5006,
}

const spawnedProcesses = []

Object.entries(programMappings).forEach(([program, PORT]) =>
  spawnedProcesses.push(
    spawn('node', [path.join(rootDirectory, program, 'index.mjs')], {
      env: { ...process.env, ROOT_STORAGE_DIR, PORT },
      stdio: 'inherit',
    })
  )
)

const httpProxy = createHttpProxy(({ method, url }) => {
  const { pathname, query } = parse(url)
  const program = `${pathname.substr(1)}/${method === 'POST' ? 'write' : 'read'}-side`
  const targetPort = programMappings[program]
  return `http://localhost:${targetPort}?${query}`
})

const PORT = 5000
http.createServer(httpProxy).listen(PORT)
console.log(`Proxy server listening on ${PORT}`)
