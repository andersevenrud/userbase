/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const Knex = require('knex')
const { Model, knexSnakeCaseMappers } = require('objection')

const knex = Knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: ':memory:'
  },
  ...knexSnakeCaseMappers()
})

Model.knex(knex)

module.exports = knex
