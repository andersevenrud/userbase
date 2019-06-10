/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

/**
 * HTTP Not found Error
 *
 * @swagger
 * components:
 *   responses:
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/definitions/errorResponseBody'
 */
class NotFoundError extends Error {
  constructor() {
    super('Resource not found')
    this.status = 404
  }
}

/**
 * HTTP Conflict Error
 *
 * @swagger
 * components:
 *   responses:
 *     ConflictError:
 *       description: Resource conflict or duplicate
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/definitions/errorResponseBody'
 */
class ConflictError extends Error {
  constructor() {
    super('Resource conflict or duplicate')
    this.status = 409
  }
}

/**
 * HTTP Conflict Error
 *
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/definitions/errorResponseBody'
 */
class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.status = 401
  }
}

/**
 * HTTP Bad Request Error
 *
 * @swagger
 * components:
 *   responses:
 *     BadRequestError:
 *       description: Bad or invalid request data
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/definitions/errorResponseBody'
 */
class BadRequestError extends Error {
  constructor(message) {
    super(message || 'Bad request')
    this.status = 400
  }
}

module.exports = {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  BadRequestError
}
