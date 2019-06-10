/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const fs = require('fs-extra')
const sharp = require('sharp')
const fileType = require('file-type')
const path = require('path')
const config = require('../config')

/**
 * Resolves a storage file
 * @param {string} filename Filename
 * @return {string}
 */
const resolve = filename => path.resolve(config.storage.root, filename)

/**
 * Reads a file from storage by name
 * @param {string} filename Filename
 * @return {Promise<{mime,stream}>}
 */
const read = async filename => {
  if (filename) {
    const full = resolve(filename)
    const exists = await fs.exists(full)

    if (exists) {
      const stream = await fs.createReadStream(full)
      const result = await fileType.stream(stream) // cloned stream!
      const mime = result.fileType
        ? result.fileType.mime
        : 'application/octet-stream'

      return { mime, stream: result }
    }
  }

  return null
}

/**
 * Resizes an image to a thumbnail
 * @param {string|Buffer} src Source Filename
 * @param {string} dest Source Filename
 * @param {number} [width] Width
 * @param {number} [height] Height
 * @return {Promise<*>}
 */
const thumbnail = async (src, dest, width = 250, height = 250) =>
  sharp(src)
    .resize(width, height)
    .png()
    .toFile(dest)

module.exports = { resolve, read, thumbnail }
