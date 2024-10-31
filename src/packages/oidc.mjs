import { config as loadEnv } from 'dotenv'
import * as client from 'openid-client'

loadEnv()

export let config

/**
 * Discover the OIDC configuration
 * @returns {Promise<void>}
 */
export async function discoverOidcConfig() {
  const server = new URL(process.env.OIDC_ISSUER)
  const clientId = process.env.OIDC_CLIENT_ID
  const clientSecret = process.env.OIDC_CLIENT_SECRET

  client.discovery(server, clientId, clientSecret).then(res => (config = res))
}

/**
 * Get the logged user from the cookies
 * @param cookies {Record<string, string>} - The request object
 * @returns The logged user if found, undefined otherwise
 */
async function getLoggedUser(cookies) {
  const access_token = cookies.access_token
  const sub = cookies.sub

  if (!access_token || !sub) return undefined

  return client.fetchUserInfo(config, access_token, sub)
    .catch(() => undefined)
}

export default async function oidcMiddleware(req, res, next) {
  const user = await getLoggedUser(req.cookies)

  if (!user) {
    return res.redirect('/auth/login?redirect=' + req.originalUrl)
  }

  req.user = user
  next()
}