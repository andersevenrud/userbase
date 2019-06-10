/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const { Model, knexSnakeCaseMappers } = require('objection')
const Knex = require('knex')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const routes = require('./routes')
const config = require('./config')
const passport = require('./services/passport')
const { NotFoundError } = require('./exceptions')

//
// Set up database
//
const knex = Knex({
  ...config.knex,
  ...knexSnakeCaseMappers()
})

Model.knex(knex)

//
// Set up passport
//
passport()

//
// Set up express
//
const app = express()
app.disable('x-powered-by')
app.use(morgan(config.morgan))
app.use(express.json())
app.use(bodyParser.text())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(config.http.public))
app.use('/', routes)

app.use((req, res, next) => {
  next(new NotFoundError())
})

app.use((error, req, res, next) => {
  const status = error.status || 500
  const message = error.message || error.toString()

  if (error.name === 'JsonSchemaValidation') {
    res.status(400)
      .json({
        error: 'Bad request',
        validation: error.validations.body
          .map(err => `${err.property.replace('request.body.', '')}: ${err.messages.join(', ')}`)
      })

    return
  }

  const acceptsJson = req.get('accept')
    .indexOf('application/json') !== -1

  if (!config.production) {
    console.error(error)
  }

  res.status(status)

  if (acceptsJson) {
    res.json({ error: message })
  }  else {
    res.send(message)
  }
})

/**
 * Make http app listen
 */
const listen = () => new Promise((resolve, reject) => {
  app.listen(config.http.port, () => {
    resolve({ config, app, knex })
  })
    .on('error', reject)
})

/**
 * Check if database is alive and working
 */
const check = () => knex.raw('select 1+1 as result')

module.exports = () => check()
  .then(listen)
