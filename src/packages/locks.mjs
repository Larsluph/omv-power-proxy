/**
 * Array of user IDs that have acquired a lock
 * @type {string[]}
 */
const locks = []

/**
 * Acquire a lock for a given user
 * @param sub {string} - The subject to acquire the lock for
 * @param onFirstLockAcquired {Function} - The function to call when the first lock is acquired
 * @returns {Promise<boolean>} - Whether the lock was acquired
 */
export async function acquireLock(sub, onFirstLockAcquired) {
  if (locks.includes(sub)) {
    return false
  }

  if (locks.length === 0) {
    await onFirstLockAcquired()
  }

  locks.push(sub)
  return true
}

/**
 * Release a lock for a given user
 * @param sub {string} - The subject to release the lock for
 * @param onAllLockReleased {Function} - The function to call when the last lock is being released
 * @returns {Promise<boolean>} - Whether the lock was released
 */
export async function releaseLock(sub, onAllLockReleased) {
  if (!locks.includes(sub)) {
    return false
  }

  if (locks.length === 1) {
    await onAllLockReleased()
  }

  locks.splice(locks.findIndex(s => s === sub), 1)
  return true
}
