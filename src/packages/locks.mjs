/**
 * Map containing lock count acquired for each key
 * @type {Map<string, number>}
 */
const locks = new Map()

/**
 * Acquire a lock for a given key
 * @param key {string} - The key to acquire a lock for
 * @param onFirstLockAcquired {Function} - The function to call when the first lock is acquired
 * @returns {Promise<boolean>} - Whether the lock was acquired
 */
export async function acquireLock(key, onFirstLockAcquired) {
  if (!locks.has(key)) {
    locks.set(key, 0)
  }

  const currentValue = locks.get(key)
  if (currentValue === 0) {
    await onFirstLockAcquired()
  }

  locks.set(key, currentValue + 1)
  console.log(locks)
  return true
}

/**
 * Release a lock for a given key
 * @param key {string} - The key to release a lock for
 * @param onAllLockReleased {Function} - The function to call when the last lock is being released
 * @returns {Promise<boolean>} - Whether the lock was released
 */
export async function releaseLock(key, onAllLockReleased) {
  if (!locks.has(key)) {
    console.log(locks)
    return false
  }

  const currentValue = locks.get(key)
  if (currentValue === 0) {
    console.log(locks)
    return false
  } else if (currentValue === 1) {
    await onAllLockReleased()
  }

  locks.set(key, currentValue - 1)
  console.log(locks)
  return true
}
