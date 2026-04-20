import wake from 'wakeonlan'
import FetchWithCookies from './http.mjs'

function createClient(options) {
  return new FetchWithCookies(options)
}

export async function poweron() {
  const { WOL_MAC_ADDRESS, WOL_BROADCAST_ADDRESS } = process.env
  if (!WOL_MAC_ADDRESS) return false

  await wake(WOL_MAC_ADDRESS, {
    address: WOL_BROADCAST_ADDRESS
  })
}

/**
 * @param client {FetchWithCookies}
 * @returns {Promise<boolean>} true on success, false if unreachable (down) or throw on uncaught
 */
export async function login(client) {
  const { OMV_USERNAME, OMV_PASSWORD } = process.env

  try {
    await client.fetch('/rpc.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'Session',
        method: 'login',
        params: { username: OMV_USERNAME, password: OMV_PASSWORD },
        options: null
      })
    })
  } catch (error) {
    if (error.cause?.code === 'EHOSTUNREACH') {
      console.error('OMV host is unreachable:', error.cause.address)
      return false
    }
    throw error
  }

  return true
}

/**
 * @param skip {boolean} If true, silently skip on errors; if false, throw errors
 */
export async function standby(skip = false) {
  const client = createClient({ baseUrl: process.env.OMV_BASE_URL })

  const loginResult = await login(client)
  if (!loginResult && skip) {
    console.log('Skipping standby: OMV host is unreachable')
    return null
  }

  return await client.fetch('/rpc.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'System',
      method: 'standby',
      params: { delay: 1 },
      options: null
    })
  })
}
