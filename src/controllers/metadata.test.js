/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const knex = require('objection-test')
const {
  handleGetMetadataList,
  handleGetMetadata,
  handlePostMetadata,
  handlePutMetadata,
  handleDeleteMetadata
} = require('./metadata')
const UserModel = require('../models/user')
const { NotFoundError, ConflictError } = require('../exceptions')
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
        password: 'abc123'
      })
  })

  afterAll(() => knex.destroy())

  it('should get list of metadata', async () => {
    await handleGetMetadataList(req, res, next)
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Array)
  })

  it('should create new metadata once', async () => {
    req.setParams({ key: 'foo' })
    req.setBody('bar')

    const insert = () => handlePostMetadata(req, res, next)

    await insert()
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)

    await insert()
    expect(next.mock.calls[0][0]).toBeInstanceOf(ConflictError)
  })

  it('should get metadata', async () => {
    req.setParams({ key: 'foo' })

    await handleGetMetadata(req, res, next)
    expect(res.send).toHaveBeenCalledWith('bar')
  })

  it('should update metadata', async () => {
    req.setParams({ key: 'foo' })
    req.setBody('baz')

    await handlePutMetadata(req, res, next)
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)
  })

  it('should not update invalid metadata', async () => {
    req.setParams({ key: 'unknown' })
    await handlePutMetadata(req, res, next)
    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError)
  })

  it('should delete metadata', async () => {
    req.setParams({ key: 'foo' })
    await handleDeleteMetadata(req, res, next)
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)
  })

  it('should not delete invalid metadata', async () => {
    req.setParams({ key: 'unknown' })
    await handleDeleteMetadata(req, res, next)
    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError)
  })
})

