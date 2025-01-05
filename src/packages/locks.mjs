import fs from 'fs'
import path from 'path'
import { poweron, standby } from './omv.mjs'

/**
 * Check if a lock exists for a given user
 * @param sub {string} - The subject to check the lock for
 * @returns {boolean} - Whether the lock exists for the user
 */
function getUserLock(sub) {
  return fs.existsSync(path.join(process.env.DATA_PATH, `${sub}.lock`))
}

/**
 * Create a lock for a given user
 * @param sub {string} - The subject to create the lock for
 */
function createLock(sub) {
  fs.writeFileSync(path.join(process.env.DATA_PATH, `${sub}.lock`), '')
}

/**
 * Delete a lock for a given user
 * @param sub {string} - The subject to delete the lock for
 */
function deleteLock(sub) {
  fs.unlinkSync(path.join(process.env.DATA_PATH, `${sub}.lock`))
}

/**
 * Clear all locks
 */
function clearLocks() {
  fs.readdirSync(process.env.DATA_PATH)
    .filter(file => file.endsWith('.lock'))
    .forEach(file => fs.unlinkSync(path.join(process.env.DATA_PATH, file)))
}

/**
 * Retrieve all locks
 * @returns {string[]}
 */
export function getLocks() {
  return fs.readdirSync(process.env.DATA_PATH)
    .filter(file => file.endsWith('.lock'))
    .map(file => file.replace('.lock', ''))
}

/**
 * Acquire a lock for a given user
 * @param sub {string} - The subject to acquire the lock for
 * @returns {Promise<boolean>} - Whether the lock was acquired
 */
export async function acquireLock(sub) {
  if (getUserLock(sub)) {
    return false
  }

  if (getLocks().length === 0) {
    await poweron()
  }

  createLock(sub)
  return true
}

/**
 * Release a lock for a given user
 * @param sub {string} - The subject to release the lock for
 * @returns {Promise<boolean>} - Whether the lock was released
 */
export async function releaseLock(sub) {
  if (!getUserLock(sub)) {
    return false
  }

  if (getLocks().length === 1) {
    await standby()
  }

  deleteLock(sub)
  return true
}

/**
 * Reset all locks
 * @returns {Promise<boolean>} - Whether locks were reset
 */
export async function resetLocks() {
  if (getLocks().length === 0) {
    return false
  }

  await standby()
  clearLocks()
  return true
}
