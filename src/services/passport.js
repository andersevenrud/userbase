/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const config = require('../config')
const UserModel = require('../models/user')
const { BadRequestError } = require('../exceptions')
const passport = require('passport')
const PassportLocal = require('passport-local')
const PassportJWT = require('passport-jwt')

/**
 * Creates the local passport strategy for authentication
 */
const createLocalStrategy = () => {
  const options = {
    usernameField: 'email',
    passwordField: 'password'
  }

  const callback = async (email, password, cb) => {
    try {
      const user = await UserModel
        .query()
        .first()
        .where('email', email)
        .whereNull('deleted_at')

      const verified = user
        ? await user.verifyPassword(password)
        : false

      if (verified) {
        cb(null, user, 'Authentication successful')
      } else {
        cb(new BadRequestError('Authentication unsuccessful'))
      }
    } catch (e) {
      cb(e)
    }
  }

  return new PassportLocal.Strategy(options, callback)
}

/**
 * Creates the JWT strategy for authorization
 */
const createJWTStrategy = () => {
  const options = {
    jwtFromRequest: PassportJWT
      .ExtractJwt
      .fromAuthHeaderWithScheme('bearer'),
    secretOrKey: config.jwt.secret
  }

  const isExpired = payload => {
    const expiresAt = new Date(payload.exp * 1000)
    const now = new Date()
    return expiresAt < now
  }

  const callback = async (payload, done) => {
    if (isExpired(payload)) {
      done(null, false)
    } else {
      try {
        const user = await UserModel
          .query()
          .first()
          .where('guid', payload.guid)

        done(null, user || false)
      } catch (e) {
        done(e)
      }
    }
  }

  return new PassportJWT.Strategy(options, callback)
}

module.exports = () => {
  passport.use(createLocalStrategy())
  passport.use(createJWTStrategy())
}
