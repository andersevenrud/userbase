/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const swagger = require('swagger-jsdoc')
const config = require('../config')

module.exports = () => swagger(config.swagger)
