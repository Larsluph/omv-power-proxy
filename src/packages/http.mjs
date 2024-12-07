import { CookieJar } from 'tough-cookie'

export default class FetchWithCookies {
  /**
   * @param options {Partial<{ baseUrl: string }>}
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl
    this.cookieJar = new CookieJar()
  }

  /**
   * @param url {string}
   * @param options {RequestInit}
   * @returns {Promise<Response<any, Record<string, any>, number>>}
   */
  async fetch(url, options = {}) {
    const headers = options.headers || {}

    const cookies = await this.cookieJar.getCookieString((this.baseUrl ?? '') + url)
    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch((this.baseUrl ?? '') + url, { ...options, headers })
    if (!response.ok) {
      throw new Error(`Received ${response.status} ${response.statusText}`);
    }

    const setCookieHeaders = response.headers.getSetCookie()
    if (setCookieHeaders) {
      await Promise.all(
        setCookieHeaders.map((cookie) => this.cookieJar.setCookie(cookie, (this.baseUrl ?? '') +  url))
      )
    }

    return response
  }
}
