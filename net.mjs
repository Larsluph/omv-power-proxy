import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

function createClient() {
  return wrapper(axios.create({ jar: new CookieJar() }))
}

export function login() {
  // TODO: login
}

export function standby() {
  // TODO: standby
}

export function shutdown() {
  // TODO: shutdown
}