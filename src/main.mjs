import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import oidcMiddleware, { discoverOidcConfig } from './packages/oidc.mjs'
import locksRouter from './routers/lockManagement.mjs'
import oidcRouter from './routers/oidc.mjs'
import powerControlRouter from './routers/powerControl.mjs'

config()

const app = express()
app.use(cookieParser())

;(function require_env() {
  const required = [
    'DATA_PATH',
    'OMV_BASE_URL',
    'OMV_USERNAME',
    'OMV_PASSWORD',
    'OIDC_ISSUER',
    'OIDC_REDIRECT_URI',
    'OIDC_CLIENT_ID',
    'OIDC_CLIENT_SECRET',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(`Missing required environment variable: ${ missing.join(',') }`)
    process.exit(1)
  }
})()

discoverOidcConfig().then(() => console.log('OIDC Discovery complete'))

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

app.use('/lock', oidcMiddleware, locksRouter)
app.use('/control', oidcMiddleware, powerControlRouter)
app.use('/auth', oidcRouter)

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