/*
 * userbase
 * @license MIT
 * @copyright Anders Evenrud <andersevenrud@gmail.com>
 */

const app = require('./src/app')

app()
  .then(({ config }) => {
    console.log(`Listening on ${config.http.port}`)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
