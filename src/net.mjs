import axios from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'

function createClient() {
  return wrapper(axios.create({ baseURL: process.env.OMV_BASE_URL, jar: new CookieJar() }))
}

export async function login() {
  const client = createClient()

  const { OMV_USERNAME, OMV_PASSWORD } = process.env

  await client.post('/rpc.php', {
    service: 'Session',
    method: 'login',
    params: { username: OMV_USERNAME, password: OMV_PASSWORD },
    options: null
  })

  return client
}

export async function standby() {
  const client = await login()

  await client.post('/rpc.php', {
    service: 'System',
    method: 'standby',
    params: { delay: 1 },
    options: null
  })
}

export async function shutdown() {
  const client = await login()

  await client.post('/rpc.php', {
    service: 'System',
    method: 'shutdown',
    params: { delay: 1 },
    options: null
  })
}