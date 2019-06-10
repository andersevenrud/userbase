/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Model, mixin } = require('objection')
const Guid = require('objection-guid')
const randToken = require('rand-token')

class UserRefreshTokenModel extends mixin(Model, [
  Guid({
    field: 'guid'
  })
]) {
  /**
   * Fetches or creates a refresh token
   * @param {UserModel} user
   * @param {string} guid
   * @return {Promise<UserRefreshTokenModel>}
   */
  static async queryFetchOrCreate(user, guid) {
    const refreshToken = await this
      .query()
      .where('guid', guid)
      .where('user_id', user.id)
      .first()

    if (!refreshToken) {
      return this
        .query()
        .insert({
          user_id: user.id,
          token: randToken.generate(256),
          guid
        })
    }

    return refreshToken
  }

  /**
   * Fetches a refresh token
   * @param {string} token
   * @return {Promise<UserRefreshTokenModel>}
   */
  static queryFetch(token) {
    return this
      .query()
      .where('token', token)
      .eager('user')
      .first()
  }

  /**
   * Removes a refresh token
   * @param {string} token
   * @return {Promise<number>}
   */
  static queryDelete(token) {
    return this
      .query()
      .where('token', token)
      .delete()
  }

  static get tableName() {
    return 'user_refresh_token'
  }

  static get relationMappings() {
    const UserModel = require('./user')

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'user.id',
          to: 'user_refresh_token.userId'
        }
      }
    }
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString()
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString()
  }
}

module.exports = UserRefreshTokenModel
