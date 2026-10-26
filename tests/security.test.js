import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, validLibrary } from '../server/security.js';

test('passwords use unique salts and reject incorrect values', async () => {
  const a = await hashPassword('some-long-password');
  const b = await hashPassword('some-long-password');
  assert.notEqual(a, b);
  assert.equal(await verifyPassword('some-long-password', a), true);
  assert.equal(await verifyPassword('wrong-password', a), false);
});
test('library validation rejects oversized lists and invalid progress', () => {
  const value = { list: [], likes: [], progress: {} };
  assert.equal(validLibrary(value), true);
  assert.equal(validLibrary({ ...value, list: Array(501).fill('orbit') }), false);
  assert.equal(
    validLibrary({
      ...value,
      progress: { orbit: { seconds: 11, duration: 10, episode: 0, updatedAt: 1 } },
    }),
    false,
  );
  assert.equal(validLibrary({ ...value, progress: [] }), false);
});
