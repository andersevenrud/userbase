/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Router } = require('express')
const config = require('./config')
const swagger = require('./services/swagger')
const swaggerUI = require('swagger-ui-express')
const authController = require('./controllers/auth')
const profileController = require('./controllers/profile')
const metadataController = require('./controllers/metadata')
const avatarController = require('./controllers/avatar')
const jwtMiddleware = require('./middleware/jwt')

const secureRouter = Router()

secureRouter.use(jwtMiddleware)
secureRouter.use('/profile', profileController.router)
secureRouter.use('/metadata', metadataController.router)
secureRouter.use('/avatar', avatarController.router)

const router = Router()

router.use('/auth', authController.router)

if (!config.production) {
  const spec = swagger()

  router.get('/api/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(spec)
  })

  router.use('/api/swagger', swaggerUI.serve, swaggerUI.setup(spec))
}

router.use('/api/v1', secureRouter)

module.exports = router
