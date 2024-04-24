import fs from 'fs'
import path from 'path'

const POWER_CONTROL_LOCK_FILE = () => path.join(process.env.DATA_PATH, 'power_disabled.lock')

export function isPowerControlDisabled() {
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
