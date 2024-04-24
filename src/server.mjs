import express from 'express'
import morgan from 'morgan'
import { config } from 'dotenv'
import { shutdown, standby } from './net.mjs'
import { disablePowerControl, enablePowerControl, isPowerControlDisabled } from "./flags.mjs";
import { AxiosError } from "axios";

config()

const app = express()

;(function require_env() {
  const required = [
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

app.use(morgan('dev'));

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
});

async function handle_signal(signal) {
  console.log(`Received ${ signal }. Exiting...`)
  process.exit(0)
}

process.on('SIGINT', handle_signal)
process.on('SIGTERM', handle_signal)

app.get('/ping', async (req, res) => {
  res.send('pong')
})

app.get('/standby', async (req, res) => {
  if (isPowerControlDisabled()) {
    res.status(403).send('Power control is disabled')
    return
  }

  try {
    await standby()
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send(JSON.stringify(err.cause))
  }
})

app.get('/shutdown', async (req, res) => {
  if (isPowerControlDisabled()) {
    res.status(403).send('Power control is disabled')
    return
  }

  try {
    await shutdown()
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send(JSON.stringify(err.cause))
  }
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
