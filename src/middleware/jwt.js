/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const passport = require('passport')

const middleware = passport.authenticate('jwt', { session: false })

module.exports = middleware
