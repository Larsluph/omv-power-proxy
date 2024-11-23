import { Router } from 'express'
import { acquireLock, getLocks, releaseLock } from '../packages/locks.mjs'
import { isAdminUser, requireAdmin } from '../packages/oidc.mjs'
import { checkPowerControl } from '../packages/powerControl.mjs'

const router = Router()

router.get('/acquire', async (req, res, next) => {
  if (!isAdminUser(req.user) && !await checkPowerControl(res, 'Lock acquisition request received', 0x13B10B)) return

  let acquired

  try {
    acquired = await acquireLock(req.user.sub)
  } catch (e) {
    return next(e)
  }

  if (!acquired) {
    return res.status(409).send("You already acquired a lock for this resource")
  }

  return res.send('OK')
})

router.get('/release', async (req, res, next) => {
  let released

  try {
    released = await releaseLock(req.user.sub)
  } catch (e) {
    return next(e)
  }

  if (!released) {
    return res.status(409).send("You don't have any lock pending for this resource")
  }

  return res.send('OK')
})

router.get('/status', requireAdmin, async (req, res, next) => {
  res.status(200).json(getLocks())
})

export default router
