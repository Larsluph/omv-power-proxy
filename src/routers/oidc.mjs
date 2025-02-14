import { createHash } from 'crypto'
import express from 'express'
import * as client from 'openid-client'
import { config } from '../packages/oidc.mjs'

const router = express.Router()

/** @type {Map<string, { code_verifier: string; redirectTo: string }>} */
const pendingRequests = new Map()

/**
 * Get the request ID
 * @param req {express.Request} - The request object
 */
function getRequestId(req) {
  const requestId = `${req.ip}:${req.headers['user-agent']}`
  return createHash('sha256').update(requestId).digest('hex')
}

/**
 * Get the redirect URI
 * @param req {express.Request} - The request object
 */
function getRedirectUri(req) {
  const protocol = req.headers['x-forwarded-proto'] ?? req.protocol
  const host = req.get('host')
  return `${ protocol }://${ host }/auth/callback`
}

/**
 * Get the current URL
 * @param req {express.Request} - The request object
 */
function getCurrentUrl(req) {
  return new URL(`${ getRedirectUri(req) }?code=${ req.query.code }`)
}

/**
 * Checks whether the URL is a valid redirect URL
 * @param req {express.Request} - The request object
 * @param url {string} - The URL to check
 */
function isValidRedirectUrl(req, url) {
  const baseUrl = `${ req.protocol }://${ req.get('host') }`
  return new URL(url, baseUrl).origin === baseUrl
}

router.get('/login', async (req, res) => {
  if (!isValidRedirectUrl(req, req.query.redirect)) {
    return res.status(400).send('Invalid redirect URL')
  }

  const code_verifier = client.randomPKCECodeVerifier()
  const code_challenge = await client.calculatePKCECodeChallenge(code_verifier)

  /** @type {Record<string, string>} */
  const parameters = {
    redirect_uri: getRedirectUri(req),
    scope: 'openid profile email groups',
    code_challenge,
    code_challenge_method: 'S256',
  }

  let redirectTo = client.buildAuthorizationUrl(config, parameters)

  pendingRequests.set(getRequestId(req), { code_verifier, redirectTo: req.query.redirect })

  res.redirect(redirectTo.href)
})

router.get('/callback', async (req, res) => {
  const parameters = pendingRequests.get(getRequestId(req))

  if (!parameters) {
    return res.status(400).send('No pending request found')
  }

  const tokens = await client.authorizationCodeGrant(config, getCurrentUrl(req), {
    pkceCodeVerifier: parameters.code_verifier,
    idTokenExpected: true,
  })

  const claims = tokens.claims()

  /** @type {express.CookieOptions} */
  const cookieOptions = {
    expires: new Date(claims.exp * 1000),
    httpOnly: true,
  }
  res.cookie('access_token', tokens.access_token, cookieOptions)
  res.cookie('sub', claims.sub, cookieOptions)

  if (parameters.redirectTo) {
    return res.redirect(parameters.redirectTo)
  }
  res.status(200).send('Logged in')
})

export default router
