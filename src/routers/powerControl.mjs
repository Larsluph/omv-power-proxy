import { Router } from 'express'
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

export default router
