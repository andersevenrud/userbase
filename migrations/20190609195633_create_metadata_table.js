/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

exports.up = (knex, Promise) =>
  knex.schema.createTable('user_metadata', t => {
    t.increments('id').unsigned().primary()
    t.integer('user_id').unsigned().index().references('id').inTable('user')
    t.string('key')
    t.text('value')
    t.dateTime('created_at').notNull()
    t.dateTime('updated_at').nullable()
    t.dateTime('deleted_at').nullable()
  })

exports.down = (knex, Promise) =>
  knex.schema.dropTable('user_metadata')
