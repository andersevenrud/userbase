/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const knex = require('objection-test')
const { handleGetProfile, handlePutProfile } = require('./profile')
const UserModel = require('../models/user')
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

  it('should update profile', async () => {
    await handlePutProfile(req, res, next)
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)
  })

  it('should get profile', async () => {
    await handleGetProfile(req, res, next)
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)
  })
})

