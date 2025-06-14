import { Router } from 'express'
import { resetLocks } from '../packages/locks.mjs'
import { disablePowerControl, enablePowerControl } from '../packages/powerControl.mjs'

const router = Router()

router.get('/enable', async (req, res) => {
  enablePowerControl()
  res.send('Power control enabled')
})

router.get('/disable', async (req, res) => {
  disablePowerControl()
  res.send('Power control disabled')
})

router.get('/reset', async (req, res, next) => {
  let locksReset
  try {
    locksReset = await resetLocks()
  } catch (e) {
    next(e)
    return
  }

  if (!locksReset) {
    res.send('No locks were reset')
    return
  }

  await sendWebhook(genPayload(`Lock reset triggered by "${req.user.preferred_username}"`, 0xF68F2C))

  res.send('Power control reset')
})

export default router
