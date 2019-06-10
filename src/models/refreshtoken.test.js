/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const knex = require('objection-test')
const UserModel = require('./user')
const UserRefreshTokenModel = require('./refreshtoken')

describe('UserRefreshTokenModel', () => {
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

  it('should create a new token', async () => {
    const result = await UserRefreshTokenModel
      .queryFetchOrCreate({ id: 1 }, 'foo')

    expect(result).toMatchObject({
      id: 1,
      user_id: 1,
      guid: 'foo'
    })

    expect(typeof result.token).toBe('string')
  })

  it('should fetch instead of creating new token', async () => {
    const result = await UserRefreshTokenModel
      .queryFetchOrCreate({ id: 1 }, 'foo')

    expect(result).toMatchObject({
      id: 1,
      guid: 'foo'
    })
  })

  it('should fetch existing token', async () => {
    await UserRefreshTokenModel
      .query()
      .insert({ user_id: 1, guid: '', token: 'jest'})

    const result = await UserRefreshTokenModel
      .queryFetch('jest')

    expect(result).toMatchObject({
      id: 2,
      guid: '',
      token: 'jest'
    })
  })

  it('should delete token', async () => {
    const result = await UserRefreshTokenModel
      .queryDelete('jest')

    const found = await UserRefreshTokenModel
      .queryFetch('jest')

    expect(result).toBe(1)
    expect(found).toBe(undefined)
  })
})

