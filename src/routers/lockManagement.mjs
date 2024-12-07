import { Router } from 'express'
import { genPayload, sendWebhook } from '../packages/discord.mjs'
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
    next(e)
    return
  }

  if (!acquired) {
    res.status(409).send("You already acquired a lock for this resource")
    return
  }

  await sendWebhook(genPayload(`Lock acquired by "${req.user.preferred_username}"`, 0x13B10B))

  res.send('OK')
})

router.get('/release', async (req, res, next) => {
  let released

  try {
    released = await releaseLock(req.user.sub)
  } catch (e) {
    next(e)
    return
  }

  if (!released) {
    res.status(409).send("You don't have any lock pending for this resource")
    return
  }

  await sendWebhook(genPayload(`Lock released by "${req.user.preferred_username}"`, 0xCBA20C))

  res.send('OK')
})

router.get('/status', requireAdmin, async (req, res, next) => {
  res.status(200).json(getLocks())
})

export default router
