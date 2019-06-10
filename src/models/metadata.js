/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Model } = require('objection')

class UserMetadataModel extends Model {

  /**
   * Deletes metadata
   * @param {UserModel} user
   * @param {string} key
   * @return {Promise<number>}
   */
  static queryDelete(user, key) {
    return this
      .query()
      .where('user_id', user.id)
      .where('key', key)
      .delete()
  }

  /**
   * Updates metadata
   * @param {UserModel} user
   * @param {string} key
   * @param {*} value
   * @return {Promise<number>}
   */
  static queryPatch(user, key, value) {
    return this
      .query()
      .where('user_id', user.id)
      .where('key', key)
      .patch({ value })
  }

  /**
   * Creates metadata
   * @param {UserModel} user
   * @param {string} key
   * @param {*} value
   * @return {Promise<UserMetadataModel>}
   */
  static queryInsert(user, key, value) {
    return this
      .query()
      .insert({
        user_id: user.id,
        key,
        value
      })
  }

  /**
   * Gets metadata
   * @param {UserModel} user
   * @param {string} key
   * @param {*} value
   * @return {Promise<UserMetadataModel>}
   */
  static queryFetch(user, key) {
    return this
      .query()
      .where('user_id', user.id)
      .where('key', key)
      .first()
  }

  /**
   * Gets metadata list
   * @param {UserModel} user
   * @param {string} key
   * @return {Promise<UserMetadataModel[]>}
   */
  static queryList(user) {
    return this
      .query()
      .where('user_id', user.id)
  }

  static get tableName() {
    return 'user_metadata'
  }

  static get relationMappings() {
    const UserModel = require('./user')

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'user.id',
          to: 'user_metadata.userId'
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

module.exports = UserMetadataModel
