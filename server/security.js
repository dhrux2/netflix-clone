import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const [salt, hex] = stored.split(':');
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
export function validLibrary(value) {
  const ids = (list) =>
    Array.isArray(list) &&
    list.length <= 500 &&
    list.every((id) => typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id));
  if (
    !value ||
    !ids(value.list) ||
    !ids(value.likes) ||
    !value.progress ||
    typeof value.progress !== 'object' ||
    Array.isArray(value.progress)
  )
    return false;
  return (
    Object.entries(value.progress).length <= 500 &&
    Object.entries(value.progress).every(
      ([id, p]) =>
        /^[a-z0-9-]{1,80}$/.test(id) &&
        p &&
        ['seconds', 'duration', 'episode', 'updatedAt'].every(
          (key) => Number.isFinite(p[key]) && p[key] >= 0,
        ) &&
        p.seconds <= p.duration &&
        Number.isInteger(p.episode) &&
        p.episode <= 1000,
    )
  );
}
