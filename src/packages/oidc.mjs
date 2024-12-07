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

/**
 * Check if the user is an admin
 * @param user {client.oauth.UserInfoResponse}
 * @returns {boolean}
 */
export function isAdminUser(user) {
  return user.groups?.includes(process.env.OIDC_ADMIN_GROUP) ?? false
}

/**
 * Middleware to check if the user is logged in
 * @param req {import('express').Request}
 * @param res {import('express').Response}
 * @param next {import('express').NextFunction}
 * @returns {Promise<void>}
 */
export async function requireLoggedIn(req, res, next) {
  const user = await getLoggedUser(req.cookies)

  if (!user) {
    res.redirect('/auth/login?redirect=' + req.originalUrl)
    return
  }

  req.user = user
  next()
}

/**
 * Middleware to check if the user is logged in
 * @param req {import('express').Request}
 * @param res {import('express').Response}
 * @param next {import('express').NextFunction}
 * @returns {Promise<void>}
 */
export async function requireAdmin(req, res, next) {
  const isAdmin = !!req.user && isAdminUser(req.user)

  if (!isAdmin) {
    res.status(403).send('Forbidden')
    return
  }

  next()
}
