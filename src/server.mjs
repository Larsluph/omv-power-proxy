import { config } from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import { checkPowerControl, disablePowerControl, enablePowerControl } from './flags.mjs'
import { acquireLock, releaseLock } from './locks.mjs'
import { poweron, standby } from './power.mjs'

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

app.get('/acquire', async (req, res) => {
  if (!await checkPowerControl(res, 'Lock acquisition request received', 0x13B10B)) return

  const acquired = await acquireLock('power', poweron)
  if (!acquired) {
    return res.status(409).send("You already acquired a lock for this resource")
  }

  return res.send('OK')
})

app.get('/release', async (req, res) => {
  if (!await checkPowerControl(res, 'Lock release request received', 0xCBA20C)) return

  const released = await releaseLock('power', standby)
  if (!released) {
    return res.status(409).send("You don't have any lock pending for this resource")
  }

  return res.send('OK')
})

app.get('/enable', async (req, res) => {
  enablePowerControl()
  res.send('Power control enabled')
})

app.get('/disable', async (req, res) => {
  disablePowerControl()
  res.send('Power control disabled')
})

// noinspection JSUnusedLocalSymbols
/**
 * Global error handler middleware
 * @param err {Error} - The error that occurred
 * @param req {express.Request} - The request object
 * @param res {express.Response} - The response object
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
