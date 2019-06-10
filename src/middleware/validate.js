/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { validate } = require('express-jsonschema')
const schema = require('../schema.json')

module.exports = name => validate({
  body: schema[name]
})
