import { express } from 'express'
import morgan from 'morgan'

const app = express()

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

app.get('/ping', async (_, res) => {
  res.send('pong')
})

app.get('/standby', async (_, res) => {
  
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
