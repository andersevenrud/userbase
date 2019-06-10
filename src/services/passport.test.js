/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const knex = require('objection-test')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const Bcrypt = require('bcrypt')
const initPassport = require('./passport')
const config =  require('../config')
const UserModel = require('../models/user')
const { Request, Response } = require('jest-express')

const createAccessToken = (user, expiresIn = '1m') =>
  jwt.sign(user.tokenPayload(), config.jwt.secret, {
    expiresIn
  })

const authenticateLocal = (req, res, next) =>
  new Promise((resolve, reject) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(user)
      }
    })(req, res, next)
  })

const authenticateJwt = (req, res, next) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(user)
      }
    })(req, res, next)
  })

describe('Passport service', () => {
  beforeAll(async () => {
    const password = await Bcrypt.hash('abc123', 12)

    initPassport()

    await knex.migrate.latest()
    await UserModel
      .query()
      .insert({
        name: 'Jest test',
        email: 'jest@test.com',
        password
      })
  })

  afterAll(() => knex.destroy())

  it('should successfully log in', async () => {
    const req = new Request()
    req.setBody({
      email: 'jest@test.com',
      password: 'abc123'
    })

    const res = new Response()
    const next = jest.fn()
    const result = await authenticateLocal(req, res, next)

    expect(result).toMatchObject({
      id: 1
    })
  })

  it('should fail to log in', async () => {
    const req = new Request()
    req.setBody({
      email: 'jest@test.com',
      password: ''
    })

    const res = new Response()
    const next = jest.fn()
    const result = await authenticateLocal(req, res, next)

    expect(result).toBe(false)
  })

  it('should successfully gate jwt', async () => {
    const req = new Request()
    const user = await UserModel.query().findById(1)
    const token = createAccessToken(user)
    req.setHeaders('authorization', `Bearer ${token}`)

    const res = new Response()
    const next = jest.fn()
    const result = await authenticateJwt(req, res, next)

    expect(result).toMatchObject({
      email: 'jest@test.com'
    })
  })

  it('should fail gate jwt', async () => {
    const req = new Request()
    req.setHeaders('authorization', 'Bearer invalid')

    const res = new Response()
    const next = jest.fn()
    const result = await authenticateJwt(req, res, next)

    expect(result).toBe(false) // FIXME
  })

  test.todo('should invalidate token') // TODO
})
