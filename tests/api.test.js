import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';

let server, db, base;
before(async () => {
  const created = createApp(':memory:');
  db = created.db;
  server = created.app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});
async function request(path, method = 'GET', body, cookie) {
  return fetch(`${base}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
async function signup(name) {
  const response = await request('/auth/signup', 'POST', {
    email: `${name}@example.com`,
    password: 'correct-horse-battery',
    name,
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  return { cookie, user: (await response.json()).user };
}
test('accounts, profile isolation, persistence, logout, and login', async () => {
  const alice = await signup('Alice');
  const bob = await signup('Bob');
  const profiles = await (await request('/profiles', 'GET', undefined, alice.cookie)).json();
  const id = profiles[0].id;
  const library = {
    list: ['orbit'],
    likes: ['orbit'],
    progress: { orbit: { seconds: 42, duration: 600, episode: 0, updatedAt: Date.now() } },
  };
  assert.equal(
    (await request(`/profiles/${id}/library`, 'PUT', library, alice.cookie)).status,
    200,
  );
  assert.deepEqual(
    await (await request(`/profiles/${id}/library`, 'GET', undefined, alice.cookie)).json(),
    library,
  );
  assert.equal(
    (await request(`/profiles/${id}/library`, 'GET', undefined, bob.cookie)).status,
    404,
  );
  assert.equal((await request(`/profiles/${id}/library`, 'PUT', library, bob.cookie)).status, 404);
  assert.equal((await request(`/profiles/${id}`, 'DELETE', undefined, alice.cookie)).status, 400);
  const extra = await (await request('/profiles', 'POST', { name: 'Second' }, alice.cookie)).json();
  assert.deepEqual(
    await (await request(`/profiles/${extra.id}/library`, 'GET', undefined, alice.cookie)).json(),
    { list: [], likes: [], progress: {} },
  );
  assert.equal(
    (await request(`/profiles/${extra.id}`, 'DELETE', undefined, alice.cookie)).status,
    200,
  );
  assert.equal((await request('/logout', 'POST', undefined, alice.cookie)).status, 200);
  assert.equal((await request('/profiles', 'GET', undefined, alice.cookie)).status, 401);
  const login = await request('/auth/login', 'POST', {
    email: 'alice@example.com',
    password: 'correct-horse-battery',
  });
  assert.equal(login.status, 200);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.headers.get('set-cookie'), /SameSite=Lax/);
  const restoredCookie = login.headers.get('set-cookie').split(';')[0];
  assert.deepEqual(
    await (await request(`/profiles/${id}/library`, 'GET', undefined, restoredCookie)).json(),
    library,
  );
});
test('invalid credentials, malformed data, and cross-origin writes are rejected', async () => {
  assert.equal(
    (await request('/auth/signup', 'POST', { email: 'bad', password: 'short', name: 'Bad' }))
      .status,
    400,
  );
  assert.equal(
    (
      await request('/auth/login', 'POST', {
        email: 'missing@example.com',
        password: 'long-but-wrong',
      })
    ).status,
    401,
  );
  const { cookie } = await signup('Charlie');
  assert.equal(
    (
      await request('/auth/signup', 'POST', {
        email: 'charlie@example.com',
        password: 'correct-horse-battery',
        name: 'Charlie',
      })
    ).status,
    409,
  );
  const [profile] = await (await request('/profiles', 'GET', undefined, cookie)).json();
  assert.equal(
    (
      await request(
        `/profiles/${profile.id}/library`,
        'PUT',
        { list: [], likes: [], progress: { orbit: { seconds: -5 } } },
        cookie,
      )
    ).status,
    400,
  );
  const csrf = await fetch(`${base}/api/logout`, {
    method: 'POST',
    headers: { Origin: 'https://another-site.example', Cookie: cookie },
  });
  assert.equal(csrf.status, 403);
  for (const origin of ['null', 'not-a-url', 'file://localhost']) {
    const rejected = await fetch(`${base}/api/logout`, {
      method: 'POST',
      headers: { Origin: origin, Cookie: cookie },
    });
    assert.equal(rejected.status, 403);
  }
  const session = await (await request('/session', 'GET', undefined, cookie)).json();
  assert.ok(session.user, 'Rejected writes must not sign the user out');
});
test('profile limit is enforced', async () => {
  const { cookie } = await signup('Dana');
  for (let i = 0; i < 4; i++)
    assert.equal(
      (await request('/profiles', 'POST', { name: `Profile ${i}` }, cookie)).status,
      201,
    );
  assert.equal((await request('/profiles', 'POST', { name: 'One too many' }, cookie)).status, 400);
});
