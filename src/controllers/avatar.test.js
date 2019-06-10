/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const fs = require('fs-extra')
const knex = require('objection-test')
const { ReadableStreamBuffer } = require('stream-buffers')
const { handleGetAvatar, handlePutAvatar } = require('./avatar')
const config = require('../config')
const storage = require('../services/storage')
const UserModel = require('../models/user')
const { NotFoundError } = require('../exceptions')
const { Request, Response } = require('jest-express')

describe('Profile controller', () => {
  let req, res, next

  beforeEach(async () => {
    res = new Response()
    next = jest.fn()
    req = new Request()
    req.user = await UserModel.query().findById(1)
    req.body = { name: 'New name' }
  })

  beforeAll(async () => {
    await knex.migrate.latest()
    await UserModel
      .query()
      .insert({
        name: 'Jest test',
        email: 'jest@test.com',
        password: 'abc123',
        avatar: 'test'
      })
  })

  afterAll(() => knex.destroy())
  afterAll(() => fs.emptyDir(config.storage.root))

  it('should not get an avatar', async () => {
    await handleGetAvatar(req, res, next)
    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError)
  })

  it('should upload avatar', async () => {
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==', 'base64')
    const stream = new ReadableStreamBuffer()
    stream.put(buffer)

    req.file = { newname: 'test', stream }

    const filename = storage.resolve('test')
    await fs.writeFile(filename, buffer)
    await handlePutAvatar(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)
  })

  it('should get an avatar', async () => {
    res.on = jest.fn()
    res.write = jest.fn()
    res.once = jest.fn()
    res.emit = jest.fn()
    res.contentType = jest.fn()

    await handleGetAvatar(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.contentType).toHaveBeenCalledWith('image/png')
  })
})
