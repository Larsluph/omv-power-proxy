/** @typedef { { embeds: [{ title: string, color: number, timestamp: string }]}} Payload */

/**
 * Generates a Discord payload valid for a webhook
 * @param title {string} - Webhook message title
 * @param color {number} - Webhook message color (hex)
 * @returns Payload - The generated payload
 */
export function genPayload(title, color) {
  return { embeds: [{ title, color, timestamp: new Date().toISOString() }] }
}

/**
 * Sends a payload to the configured Discord webhook
 * @param payload {Payload} - The payload to send
 * @returns {Promise<void>}
 */
export async function sendWebhook(payload) {
  const { DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env
  if (!DISCORD_WEBHOOK_ID || !DISCORD_WEBHOOK_TOKEN) {
    const { title, timestamp } = payload.embeds[0]
    console.log(`[${timestamp}] ${title}`)
    return
  }

  const url = `https://discord.com/api/webhooks/${ DISCORD_WEBHOOK_ID }/${ DISCORD_WEBHOOK_TOKEN }?wait=true`

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (e) {
    console.error('Unable to send webhook', e)
  }
}
