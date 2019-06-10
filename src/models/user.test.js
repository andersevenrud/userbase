/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const knex = require('objection-test')
const UserModel = require('./user')

describe('UserModel', () => {
  beforeAll(async () => knex.migrate.latest())
  afterAll(() => knex.destroy())

  it('should create a new user', async () => {
    const result = await UserModel
      .query()
      .insert({
        name: 'Jest test',
        email: 'jest@test.com',
        password: 'abc123'
      })

    expect(result).toMatchObject({
      name: 'Jest test',
      email: 'jest@test.com'
    })
  })

  it('should patch avatar', async () => {
    const result = await UserModel
      .queryPatchAvatar({ id: 1 }, 'abc123')

    expect(result).toMatchObject({
      avatar: 'abc123'
    })
  })

  it('should patch profile', async () => {
    const result = await UserModel
      .queryPatchProfile({ id: 1 }, { name: 'New name' })

    expect(result).toMatchObject({
      name: 'New name'
    })
  })

  it('should patch last login timestamp', async () => {
    const old = await UserModel
      .query()
      .findById(1)

    const updated = await UserModel
      .queryPatchLastLogin({ id: 1 })

    const latest = await UserModel
      .query()
      .findById(1)

    expect(updated).toBe(1)
    expect(old.lastLoginAt).not.toBe(latest.lastLoginAt)
  })
})

