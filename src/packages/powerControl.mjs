import fs from 'fs'
import path from 'path'
import { genPayload, sendWebhook } from './discord.mjs'

const POWER_CONTROL_LOCK_FILE = () => path.join(process.env.DATA_PATH, 'power_disabled.lock')

function isPowerControlDisabled() {
  return fs.existsSync(POWER_CONTROL_LOCK_FILE())
}

export function enablePowerControl() {
  if (isPowerControlDisabled()) {
    fs.unlinkSync(POWER_CONTROL_LOCK_FILE())
  }
}

export function disablePowerControl() {
  if (!isPowerControlDisabled()) {
    fs.writeFileSync(POWER_CONTROL_LOCK_FILE(), '', { flag: 'wx', mode: 0o644 })
  }
}

export async function checkPowerControl(res, title, color) {
  if (isPowerControlDisabled()) {
    res.status(403).send('Power control is disabled')
    await sendWebhook(genPayload(title, color))
    return false
  }
  return true
}