/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Router } = require('express')
const UserMetadataModel = require('../models/metadata')
const validate = require('../middleware/validate')
const { NotFoundError, ConflictError } = require('../exceptions')

/**
 * Get user metadata list
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /api/v1/metadata:
 *   get:
 *     summary: Get metadata
 *     tags:
 *      - metadata
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Metadata list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/userMetadataListResponseBody'
 */
const handleGetMetadataList = (req, res, next) =>
  UserMetadataModel.queryList(req.user)
    .then(metadata => metadata.map(
      ({ key, value }) => ({ key, value })
    ))
    .then(metadata => res.json(metadata))
    .catch(next)

/**
 * Get user metadata entry by key
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /api/v1/metadata/{key}:
 *   get:
 *     summary: Get metadata
 *     tags:
 *      - metadata
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - name: key
 *        description: Metadata key
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       200:
 *         description: Metadata value
 *         content:
 *           text/plain:
 *             schema:
 *               $ref: '#/definitions/userMetadataResponseBody'
 */
const handleGetMetadata = (req, res, next) =>
  UserMetadataModel.queryFetch(req.user, req.params.key)
    .then(metadata => metadata
      ? res.send(metadata.value)
      : next(new NotFoundError()))
    .catch(next)

/**
 * Crate user metadata entry from key
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /api/v1/metadata/{key}:
 *   post:
 *     summary: Create metadata
 *     tags:
 *      - metadata
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - name: key
 *        description: Metadata key
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *      content:
 *        text/plain:
 *          required: true
 *          schema:
 *            $ref: '#/definitions/createUserMetadataRequestBody'
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/successResponseBody'
 */
const handlePostMetadata = async (req, res, next) => {
  try {
    const found = await UserMetadataModel.queryFetch(req.user, req.params.key)

    if (found) {
      next(new ConflictError())
    } else {
      await UserMetadataModel.queryInsert(req.user, req.params.key, req.body)

      res.json({ success: true })
    }
  } catch (e) {
    next(e)
  }
}

/**
 * Update user metadata entry from key
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /api/v1/metadata/{key}:
 *   put:
 *     summary: Update metadata
 *     tags:
 *      - metadata
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - name: key
 *        description: Metadata key
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *      content:
 *        text/plain:
 *          required: true
 *          schema:
 *            $ref: '#/definitions/updateUserMetadataRequestBody'
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/successResponseBody'
 */
const handlePutMetadata = (req, res, next) =>
  UserMetadataModel.queryPatch(req.user, req.params.key, req.body)
    .then(count => count
      ? res.json({ success: true })
      : next(new NotFoundError()))
    .catch(next)

/**
 * Delete user metadata entry from key
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /api/v1/metadata/{key}:
 *   delete:
 *     summary: Delete metadata
 *     tags:
 *      - metadata
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - name: key
 *        description: Metadata key
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/successResponseBody'
 */
const handleDeleteMetadata = (req, res, next) =>
  UserMetadataModel.queryDelete(req.user, req.params.key)
    .then(count => count
      ? res.json({ success: true })
      : next(new NotFoundError()))
    .catch(next)

/**
 * User controller router
 * @type {express.Router}
 */
const router = Router()
router.get('/', handleGetMetadataList)
router.get('/:key', handleGetMetadata)
router.post('/:key', validate('createUserMetadataRequestBody'), handlePostMetadata)
router.put('/:key', validate('updateUserMetadataRequestBody'), handlePutMetadata)
router.delete('/:key', handleDeleteMetadata)

module.exports = {
  router,
  handleGetMetadataList,
  handleGetMetadata,
  handlePostMetadata,
  handlePutMetadata,
  handleDeleteMetadata
}
