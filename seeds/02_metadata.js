/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

exports.seed = (knex, Promise) =>
  knex('user_metadata').del()
    .then(() => {
      return knex('user_metadata').insert([
        {
          user_id: 1,
          key: 'preferences',
          value: '{}',
          created_at: new Date().toISOString()
        }
      ])
    })
