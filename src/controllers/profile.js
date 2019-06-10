/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Router } = require('express')
const validate = require('../middleware/validate')
const UserModel = require('../models/user')

/**
 * Get user profile
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 *
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get User profile
 *     tags:
 *      - profile
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/userProfileResponseBody'
 */
const handleGetProfile = (req, res) =>
  res.json(req.user)

/**
 * Update user profile
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next function
 *
 * @swagger
 * /api/v1/profile:
 *   put:
 *     summary: Update profile
 *     tags:
 *      - profile
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      content:
 *        application/json:
 *          required: true
 *          schema:
 *            $ref: '#/definitions/updateUserProfileRequestBody'
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/successResponseBody'
 */
const handlePutProfile = (req, res, next) =>
  UserModel.queryPatchProfile(req.user, req.body)
    .then(() => res.json({ success: true }))
    .catch(next)

/**
 * User controller router
 * @type {express.Router}
 */
const router = Router()
router.get('/', handleGetProfile)
router.put('/', validate('updateUserProfileRequestBody'), handlePutProfile)

module.exports = { router, handleGetProfile, handlePutProfile }
