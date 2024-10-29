import { config } from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import locksRouter from './routers/lockManagement.mjs'
import powerControlRouter from './routers/powerControl.mjs'

config()

const app = express()

;(function require_env() {
  const required = [
    'DATA_PATH',
    'OMV_BASE_URL',
    'OMV_USERNAME',
    'OMV_PASSWORD'
  ]

  required.forEach((key) => {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${ key }`)
      process.exit(1)
    }
  })
})()

const PORT = process.env.PORT || 3000

app.use(morgan(':remote-addr - [:date[clf]] ":method :url" :status :total-time ms :res[content-length]'))

async function handle_signal(signal) {
  console.log(`Received ${ signal }. Exiting...`)
  process.exit(0)
}

process.on('SIGINT', handle_signal)
process.on('SIGTERM', handle_signal)

app.get('/ping', async (req, res) => {
  res.send('pong')
})

app.use(locksRouter)
app.use(powerControlRouter)

// noinspection JSUnusedLocalSymbols
/**
 * Global error handler middleware
 * @param err {Error} - The error that occurred
 * @param req {import('express').Request} - The request object
 * @param res {import('express').Response} - The response object
 * @param next {Function} - The next middleware function
 */
function errorHandler(err, req, res, next) {
  console.error(err)
  console.error(err.stack)
  res.status(500).send(JSON.stringify(err.cause))
}
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${ PORT }`)
})
