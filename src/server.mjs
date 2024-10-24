import { config } from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import { checkPowerControl, disablePowerControl, enablePowerControl } from './flags.mjs'
import { poweron, shutdown, standby } from './net.mjs'

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

// error handler
// noinspection JSUnusedLocalSymbols
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

async function handle_signal(signal) {
  console.log(`Received ${ signal }. Exiting...`)
  process.exit(0)
}

process.on('SIGINT', handle_signal)
process.on('SIGTERM', handle_signal)

async function run_safe_proc(res, proc) {
  try {
    await proc()
    res.send('OK')
  } catch (err) {
    console.error(err)
    console.error(err.stack)
    res.status(500).send(JSON.stringify(err.cause))
  }
}

app.get('/ping', async (req, res) => {
  res.send('pong')
})

app.get('/poweron', async (req, res) => {
  if (!await checkPowerControl(res, 'Power ON request received', 0x13B10B)) return
  await run_safe_proc(res, async () => await poweron())
})

app.get('/standby', async (req, res) => {
  if (!await checkPowerControl(res, 'Sleep request received', 0xCBA20C)) return
  await run_safe_proc(res, async () => await standby())
})

app.get('/shutdown', async (req, res) => {
  if (!await checkPowerControl(res, 'Shut down request received', 0xBA0808)) return
  await run_safe_proc(res, async () => await shutdown())
})

app.get('/power/enable', async (req, res) => {
  enablePowerControl()
  res.send('Power control enabled')
})

app.get('/power/disable', async (req, res) => {
  disablePowerControl()
  res.send('Power control disabled')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${ PORT }`)
})
