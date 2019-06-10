/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const Bcrypt = require('bcrypt')
const uuid = require('uuid/v4')

exports.seed = (knex, Promise) =>
  knex('user').del()
    .then(() => Bcrypt.hash('string', 12))
    .then(password => {
      return knex('user').insert([
        {
          name: 'test user',
          email: 'user@example.com',
          guid: uuid(),
          password,
          created_at: new Date().toISOString()
        }
      ])
    })
