/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

exports.up = (knex, Promise) =>
  knex.schema.createTable('user', t => {
    t.increments('id').unsigned().primary()
    t.string('guid')
    t.string('name')
    t.string('email')
    t.string('password')
    t.string('avatar').nullable()
    t.dateTime('last_login_at').nullable()
    t.dateTime('created_at').notNull()
    t.dateTime('updated_at').nullable()
    t.dateTime('deleted_at').nullable()
  })

exports.down = (knex, Promise) =>
  knex.schema.dropTable('user')
