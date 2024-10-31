import { Router } from 'express'
import { acquireLock, releaseLock } from '../packages/locks.mjs'
import { poweron, standby } from '../packages/omv.mjs'
import { checkPowerControl } from '../packages/powerControl.mjs'

const router = Router()

router.get('/acquire', async (req, res, next) => {
  if (!await checkPowerControl(res, 'Lock acquisition request received', 0x13B10B)) return

  let acquired

  try {
    acquired = await acquireLock(req.user.sub, poweron)
  } catch (e) {
    return next(e)
  }

  if (!acquired) {
    return res.status(409).send("You already acquired a lock for this resource")
  }

  return res.send('OK')
})

router.get('/release', async (req, res, next) => {
  if (!await checkPowerControl(res, 'Lock release request received', 0xCBA20C)) return

  let released

  try {
    released = await releaseLock(req.user.sub, standby)
  } catch (e) {
    return next(e)
  }

  if (!released) {
    return res.status(409).send("You don't have any lock pending for this resource")
  }

  return res.send('OK')
})

export default router
