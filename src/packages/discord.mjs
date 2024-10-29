import axios from 'axios'

export function genPayload(title, color) {
  return { embeds: [{ title, color, timestamp: new Date().toISOString() }] }
}

export async function sendWebhook(payload) {
  const { DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env
  if (!DISCORD_WEBHOOK_ID || !DISCORD_WEBHOOK_TOKEN) {
    console.warn('Webhook environment variables not set, skipping')
    return
  }

  const url = `https://discord.com/api/webhooks/${ DISCORD_WEBHOOK_ID }/${ DISCORD_WEBHOOK_TOKEN }?wait=true`

  try {
    await axios.post(url, payload)
  } catch (e) {
    console.error('Unable to send webhook', e)
  }
}
