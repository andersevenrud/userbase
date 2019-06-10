/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

exports.up = (knex, Promise) =>
  knex.schema.createTable('user_refresh_token', t => {
    t.increments('id').unsigned().primary()
    t.integer('user_id').unsigned().index().references('id').inTable('user')
    t.string('guid').notNull()
    t.string('token').notNull()
    t.dateTime('created_at').notNull()
    t.dateTime('updated_at')
  })

exports.down = (knex, Promise) =>
  knex.schema.dropTable('user_refresh_token')
