/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const os = require('os')
const path = require('path')
const xbytes = require('xbytes')
const pkg = require('../package.json')
const schema = require('./schema.json')
require('dotenv').config()

const port = process.env.HTTP_PORT || 3000

const test = process.env.NODE_ENV === 'test'

const storageRoot = test
  ? path.resolve(os.tmpdir(), `jest_${pkg.name}`)
  : process.env.STORAGE_ROOT || path.resolve(__dirname, '../storage')

module.exports = {
  // Environment
  production: process.env.NODE_ENV === 'production',

  // Logger
  morgan: 'tiny',

  // Express
  http: {
    port,
    public: path.resolve(__dirname, '../dist')
  },

  // Passport
  jwt: {
    secret: test ? 'jest' : process.env.JWT_SECRET || 'cats',
    expires: process.env.JWT_EXPIRES || '30m'
  },

  // Database
  knex: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: 'app.db'
    }
  },

  // File storage
  storage: {
    root: storageRoot,
    maxSize: xbytes.parseSize(process.env.STORAGE_MAX_SIZE || '5MiB')
  },

  // Swagger / OpenAPI
  swagger: {
    definition: {
      openapi: '3.0.0',
      info: {
        title: pkg.name,
        version: pkg.version,
        description: pkg.description,
        contact: {
          email: pkg.author
        }
      },
      servers: [{
        url: `http://localhost:${port}`,
        description: 'Local development server'
      }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            name: 'authorization',
            description: 'JWT Bearer Token from login',
            scheme: 'bearer',
            in: 'header',
            bearerFormat: 'JWT'
          }
        }
      },
      definitions: schema
    },
    apis: [
      path.resolve(__dirname, 'exceptions.js'),
      path.resolve(__dirname, 'controllers/*.js')
    ]
  }
}
