/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */
const fs = require('fs-extra')
const streamio = require('stream')
const path = require('path')
const config = require('../config')
const storage = require('./storage')

describe('Storage service', () => {
  beforeAll(() => fs.ensureDir(config.storage.root))
  afterAll(() => fs.emptyDir(config.storage.root))

  it('should resolve filename', () => {
    const filename = storage.resolve('test')
    const check = path.resolve(config.storage.root, 'test')
    expect(filename).toBe(check)
  })

  it('should read file', async () => {
    const filename = storage.resolve('test.txt')
    await fs.writeFile(filename, 'hello world, this is just a test from jest')
    const { mime, stream } = await storage.read(filename)
    expect(stream).toBeInstanceOf(streamio.PassThrough)
    expect(mime).toBe('application/octet-stream') // FIXME
  })

  it('should not read invalid file', async () => {
    const filename = storage.resolve('invalid.txt')
    const result = await storage.read(filename)
    expect(result).toBe(null)
  })

  test.todo('should create thumbnail') // TODO
})
