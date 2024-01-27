import crypto from 'crypto'

export const createMd5Hash = (input) => crypto.createHash('md5').update(input).digest('hex')
