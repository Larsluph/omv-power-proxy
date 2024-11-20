import { poweron, standby } from './omv.mjs'

/**
 * Array of user IDs that have acquired a lock
 * @type {string[]}
 */
const locks = []

/**
 * Acquire a lock for a given user
 * @param sub {string} - The subject to acquire the lock for
 * @returns {Promise<boolean>} - Whether the lock was acquired
 */
export async function acquireLock(sub) {
  if (locks.includes(sub)) {
    return false
  }

  if (locks.length === 0) {
    await poweron()
  }

  locks.push(sub)
  return true
}

/**
 * Release a lock for a given user
 * @param sub {string} - The subject to release the lock for
 * @returns {Promise<boolean>} - Whether the lock was released
 */
export async function releaseLock(sub) {
  if (!locks.includes(sub)) {
    return false
  }

  if (locks.length === 1) {
    await standby()
  }

  locks.splice(locks.findIndex(s => s === sub), 1)
  return true
}

/**
 * Reset all locks
 * @returns {Promise<boolean>} - Whether locks were reset
 */
export async function resetLocks() {
  if (locks.length === 0) {
    return false
  }

  await standby()
  locks.splice(0, locks.length)
  return true
}
