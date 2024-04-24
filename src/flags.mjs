let powerControlDisabled = false

export function isPowerControlDisabled() {
  return powerControlDisabled
}

export function enablePowerControl() {
  powerControlDisabled = false
}

export function disablePowerControl() {
  powerControlDisabled = true
}
