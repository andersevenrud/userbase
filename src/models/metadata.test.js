/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const knex = require('objection-test')
const UserModel = require('./user')
const UserMetadataModel = require('./metadata')

describe('UserMetadataModel', () => {
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

  it('should create a new metadata', async () => {
    const result = await UserMetadataModel
      .queryInsert({ id: 1 }, 'foo', 'bar')

    expect(result).toMatchObject({
      key: 'foo',
      value: 'bar'
    })
  })

  it('should get metadata', async () => {
    const result = await UserMetadataModel
      .queryFetch({ id: 1 }, 'foo')

    expect(result).toMatchObject({
      key: 'foo',
      value: 'bar'
    })
  })

  it('should get metadata list', async () => {
    const result = await UserMetadataModel
      .queryList({ id: 1 })

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'foo',
          value: 'bar'
        })
      ])
    )
  })

  it('should patch metadata', async () => {
    const result = await UserMetadataModel
      .queryPatch({ id: 1 }, 'foo', 'jazz')

    expect(result).toBe(1)
  })

  it('should delete metadata', async () => {
    const result = await UserMetadataModel
      .queryDelete({ id: 1 }, 'foo')

    expect(result).toBe(1)
  })
})

