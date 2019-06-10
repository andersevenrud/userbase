/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const os = require('os')
const multer = require('multer')
const config = require('../config')
const uuid = require('uuid/v4')
const { BadRequestError } = require('../exceptions')

/**
 * Creates a new multer instance
 * @param {object} options Multer options
 */
const upload = options => multer({
  limits: {
    fileSize: config.storage.maxSize
  },
  fileFilter: (req, file, cb) => {
    const accept = options.filter
      ? options.filter.indexOf(file.mimetype) !== -1
      : true

    if (accept) {
      cb(null, true)
    } else {
      cb(new BadRequestError('Invalid upload file type'))
    }
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, options.temp ? os.tmpdir() : config.storage.root)
    },
    filename: (req, file, cb) => {
      cb(null, uuid())
    }
  })
})

/**
 * Uploads file to storage with a unique name
 * @param {boolean} [options.temp] Upload to temporary path
 * @param {string[]} [options.filter] Filter files by mimes
 */
const middleware = (options = {}) =>
  upload(options)
    .single('upload')

module.exports = middleware
