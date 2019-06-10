/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Router } = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const config = require('../config')
const UserModel = require('../models/user')
const validate = require('../middleware/validate')
const UserRefreshTokenModel = require('../models/refreshtoken')
const { NotFoundError } = require('../exceptions')

/**
 * Creates new Access Token
 * @param {UserModel} user
 * @return {string}
 */
const createAccessToken = user =>
  jwt.sign(user.tokenPayload(), config.jwt.secret, {
    expiresIn: config.jwt.expires
  })

/**
 * Creates a response that contains a token and user profile
 * @param {UserModel} user User model instance
 * @param {UserRefreshTokenModel} refreshToken User refresh token model instance
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 */
const respondWithToken = (user, refreshToken, req, res, next) => {
  const callback = err => {
    if (err) {
      next(err)
    } else {
      const accessToken = createAccessToken(user)

      res.json({
        accessToken,
        refreshToken: refreshToken.token,
        user: user.tokenPayload()
      })
    }
  }

  req.login(user, { session: false }, callback)
}

/**
 * Handle login requests
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in user
 *     description: Create new token from login
 *     tags:
 *      - auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/loginRequestBody'
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/loginResponseBody'
 */
const handlePostLogin = (req, res, next) => {
  const callback = async (err, user, info) => {
    if (err) {
      next(err)
    } else {
      try {
        const guid = req.body.guid || ''
        const refreshToken = await UserRefreshTokenModel.queryFetchOrCreate(user, guid)

        await UserModel.queryPatchLastLogin(user)

        respondWithToken(user, refreshToken, req, res, next)
      } catch (e) {
        next(e)
      }
    }
  }

  passport.authenticate('local', { session: false }, callback)(req, res, next)
}

/**
 * Handle renew access token requests
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /auth/token/reject:
 *   post:
 *     summary: Reject refresh token
 *     tags:
 *      - auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/rejectTokenRequestBody'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/successResponseBody'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const handlePostReject = (req, res, next) =>
  UserRefreshTokenModel.queryDelete(req.body.token)
    .then(count => count
      ? res.json({ success: true })
      : next(new NotFoundError()))
    .catch(next)

/**
 * Handle renew access token requests
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /auth/token/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *      - auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/refreshTokenRequestBody'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/refreshTokenResponseBody'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
const handlePostRefresh = (req, res, next) =>
  UserRefreshTokenModel.queryFetch(req.body.token)
    .then(result => {
      if (result) {
        res.json({
          accessToken: createAccessToken(result.user)
        })
      } else {
        next(new NotFoundError())
      }
    })
    .catch(next)

/**
 * Auth controller router
 * @type {express.Router}
 */
const router = Router()
router.post('/login', validate('loginRequestBody'), handlePostLogin)
router.post('/token/reject', validate('rejectTokenRequestBody'), handlePostReject)
router.post('/token/refresh', validate('refreshTokenRequestBody'), handlePostRefresh)

module.exports = { router, handlePostRefresh, handlePostReject, handlePostLogin }
