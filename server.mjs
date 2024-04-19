import express from 'express'
import morgan from 'morgan'
import { config } from 'dotenv'
import { standby, shutdown } from './net.mjs'

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
      console.error(`Missing required environment variable: ${key}`)
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
  console.log(`Received ${signal}. Exiting...`)
  process.exit(0)
}

process.on('SIGINT', handle_signal)
process.on('SIGTERM', handle_signal)

app.get('/ping', async (req, res) => {
  res.send('pong')
})

app.get('/standby', async (req, res) => {
  try {
    await standby()
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error')
  }
})

app.get('/shutdown', async (req, res) => {
  try {
    await shutdown()
    res.send('OK')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error')
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
