/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Model, mixin } = require('objection')
const { pickBy } = require('lodash')
const Password = require('objection-password')
const Guid = require('objection-guid')
const Visibility = require('objection-visibility').default

class UserModel extends mixin(Model, [
  Visibility,
  Password(),
  Guid({
    field: 'guid'
  })
]) {
  tokenPayload() {
    return {
      guid: this.guid,
      email: this.email,
      name: this.name
    }
  }

  /**
   * Updates user avatar
   * @param {UserModel} user
   * @param {string} filename
   * @return {Promise<UserModel>}
   */
  static queryPatchAvatar(user, filename) {
    return this
      .query()
      .patchAndFetchById(user.id, {
        avatar: filename
      })
  }

  /**
   * Updates user profile
   * @param {UserModel} user
   * @param {object} body
   * @return {Promise<UserModel>}
   */
  static queryPatchProfile(user, body) {
    const filterProfile = (value, key) =>
      ['name'].indexOf(key) !== -1

    const data = pickBy(body, filterProfile)

    return this
      .query()
      .patchAndFetchById(user.id, data)
  }

  /**
   * Updates last login timestamp
   * @param {UserModel} user
   * @return {Promise<number>}
   */
  static queryPatchLastLogin(user) {
    return this
      .query()
      .patch({
        lastLoginAt: new Date().toISOString()
      })
      .where('id', user.id)
  }

  static get hidden() {
    return ['id', 'password', 'deletedAt']
  }

  static get tableName() {
    return 'user'
  }

  static get relationMappings() {
    const UserMetadataModel = require('./metadata')
    const UserRefreshTokenModel = require('./refreshtoken')

    return {
      metadata: {
        relation: Model.HasManyRelation,
        modelClass: UserMetadataModel,
        join: {
          from: 'user.id',
          to: 'user_metadata.userId'
        }
      },
      refreshtokens: {
        relation: Model.HasManyRelation,
        modelClass: UserRefreshTokenModel,
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

module.exports = UserModel
