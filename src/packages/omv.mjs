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
 */
export async function login(client) {
  const { OMV_USERNAME, OMV_PASSWORD } = process.env

  return await client.fetch('/rpc.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'Session',
      method: 'login',
      params: { username: OMV_USERNAME, password: OMV_PASSWORD },
      options: null
    })
  })
}

export async function standby() {
  const client = createClient({ baseUrl: process.env.OMV_BASE_URL })

  await login(client)

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
