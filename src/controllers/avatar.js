/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Router } = require('express')
const storageMiddleware = require('../middleware/storage')
const storage = require('../services/storage')
const uuid = require('uuid/v4')
const UserModel = require('../models/user')
const { NotFoundError } = require('../exceptions')

/**
 * Creates avatar from avatar upload
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 */
const generateThumbnailMiddleware = (req, res, next) => {
  const src = req.file.path
  const name = uuid()
  const dest = storage.resolve(name)

  return storage
    .thumbnail(src, dest)
    .then(filename => {
      req.file.newname = name
      next()
    })
    .catch(error => next(error))
}

/**
 * Get user avatar
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 *
 * @swagger
 * /api/v1/avatar:
 *   get:
 *     summary: Get User avatar
 *     tags:
 *      - avatar
 *     security:
 *      - bearerAuth: []
 *     produces:
 *      - image/png
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       200:
 *         description: Avatar image
 *         content:
 *           image/png:
 *             schema:
 *               $ref: '#/definitions/avatarImage'
 */
const handleGetAvatar = (req, res, next) =>
  storage.read(req.user.avatar)
    .then(file => {
      if (file) {
        res.contentType(file.mime)
        file.stream.pipe(res)
      } else {
        next(new NotFoundError())
      }
    })
    .catch(next)

/**
 * Update user avatar
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /api/v1/avatar:
 *   put:
 *     summary: Update avatar
 *     tags:
 *      - avatar
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      content:
 *        multipart/form-data:
 *          required: true
 *          schema:
 *            $ref: '#/definitions/uploadAvatarRequestBody'
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *           description: Success
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/definitions/uploadAvatarResponseBody'
 */
const handlePutAvatar = (req, res, next) =>
  UserModel.queryPatchAvatar(req.user, req.file.newname)
    .then(() => res.json({ success: true }))
    .catch(next)

/**
 * User controller router
 * @type {express.Router}
 */
const router = Router()
router.get('/', handleGetAvatar)
router.put('/',
  storageMiddleware({
    temp: true,
    filter: ['image/png', 'image/jpeg']
  }),
  generateThumbnailMiddleware,
  handlePutAvatar
)

module.exports = { router, handleGetAvatar, handlePutAvatar }
