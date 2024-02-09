import { readFile, writeFile, rename } from 'fs/promises'
import { generateId } from './id.mjs'

export const readFileWithFallback = async (filePath, fallback) => {
  return await readFile(filePath, 'utf-8').catch(() => fallback)
}

export const writeFileAtomically = async (filePath, content) => {
  const tempPath = `${filePath}-${generateId()}.tmp`
  await writeFile(tempPath, content)
  await rename(tempPath, filePath)
}
