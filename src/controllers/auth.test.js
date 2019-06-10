/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const fs = require('fs-extra')
const knex = require('objection-test')
const Bcrypt = require('bcrypt')
const { handlePostRefresh, handlePostReject, handlePostLogin } = require('./auth')
const passport = require('../services/passport')
const config = require('../config')
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
    passport()

    const password = await Bcrypt.hash('abc123', 12)

    await knex.migrate.latest()
    await UserModel
      .query()
      .insert({
        name: 'Jest test',
        email: 'jest@test.com',
        password,
        avatar: 'test'
      })
  })

  afterAll(() => knex.destroy())
  afterAll(() => fs.emptyDir(config.storage.root))

  it('should log in', async () => {
    req.login = jest.fn((user, options, callback) => {
      callback(null)
    })

    req.setBody({
      email: 'jest@test.com',
      password: 'abc123',
    })

    // This works around a non async chain
    const origJson = res.json
    await new Promise(resolve => {
      res.json = jest.fn(result => {
        resolve(result)
        origJson(result)
      })

      handlePostLogin(req, res, err => {
        resolve()
        next(err)
      })
    })

    expect(next).not.toHaveBeenCalled()
    expect(req.login).toHaveBeenCalled()
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)
  })

  it('should create access token once', async () => {
    const user = await UserModel
      .query()
      .eager('refreshtokens')
      .findById(1)

    req.setBody({
      token: user.refreshtokens[0].token
    })

    await handlePostRefresh(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)
  })

  it('should not create access token', async () => {
    req.setBody({
      token: 'invalid'
    })

    await handlePostRefresh(req, res, next)

    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError)
  })

  it('should delete access token once', async () => {
    const user = await UserModel
      .query()
      .eager('refreshtokens')
      .findById(1)

    req.setBody({
      token: user.refreshtokens[0].token
    })

    await handlePostReject(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(Object)

    await handlePostReject(req, res, next)
    expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError)
  })
})
