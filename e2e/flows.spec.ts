import { test, expect } from '@playwright/test';

test('guest discovers a title, saves it, and finds it after a reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'THE LAST FRONTIER' })).toBeVisible();
  await page.getByRole('button', { name: 'Search titles', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search titles, genres, or cast' }).fill('orbit');
  await expect(page.locator('.title-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Details for Orbit' }).click();
  await page.getByRole('button', { name: 'My list', exact: true }).click();
  await page.getByRole('button', { name: 'Close title preview' }).click();
  await page.getByRole('link', { name: 'My Netflix', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Details for Orbit' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'Details for Orbit' })).toBeVisible();
});
test('search empty state, genre filtering, and unknown routes', async ({ page }) => {
  await page.goto('/search?q=does-not-exist');
  await expect(page.getByRole('heading', { name: 'No stories found. Yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByLabel('Genre', { exact: true }).selectOption('Sci-Fi');
  await expect(page.locator('.title-card')).toHaveCount(1);
  await page.goto('/title/not-a-title');
  await expect(page.getByRole('heading', { name: "This story isn't here." })).toBeVisible();
});
test('account and profile libraries remain independent', async ({ page }) => {
  await page.goto('/account');
  await page.getByLabel('Profile name').fill('Reviewer');
  await page.getByLabel('Email address').fill(`reviewer-${Date.now()}@example.com`);
  await page.getByLabel('Password', { exact: true }).fill('a-good-demo-password');
  await page.getByRole('button', { name: 'Create your account' }).click();
  await expect(page.getByRole('heading', { name: "Who's settling in?" })).toBeVisible();
  await page.getByRole('button', { name: 'Add profile', exact: true }).click();
  await page.getByLabel('New profile name').fill('Second');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('button', { name: /Second/ })).toBeVisible();
  await page.getByRole('button', { name: /Reviewer/ }).click();
  await page.goto('/title/orbit');
  await page.getByRole('button', { name: 'My list', exact: true }).click();
  await page.getByRole('link', { name: 'Profiles: Reviewer' }).click();
  await page.getByRole('button', { name: /Second/ }).click();
  await expect(page.getByRole('link', { name: 'Profiles: Second' })).toBeVisible();
  await page.goto('/my-list');
  await expect(
    page.getByRole('heading', { name: 'Your next favorite belongs here.' }),
  ).toBeVisible();
});

test('hover reveals metadata and quick actions without moving neighboring cards', async ({
  page,
}) => {
  await page.goto('/movies');
  const cards = page.locator('.title-card');
  const neighbor = await cards.nth(1).boundingBox();
  await cards.first().hover();
  const preview = page.getByRole('region', { name: /Preview of/ });
  await expect(preview).toBeVisible();
  await preview.getByRole('button', { name: /Like / }).click();
  await expect(preview.getByRole('button', { name: /Like / })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect((await cards.nth(1).boundingBox())?.x).toBe(neighbor?.x);
});
test('mobile navigation and layout stay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'Movies', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Make a night of it.' })).toBeVisible();
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
});

test('preview restores browse position and keyboard focus', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('link', { name: 'Details for Midnight City' }).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(page.getByRole('dialog', { name: 'Title preview' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(card).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('textbox', { name: 'Search titles, genres, or cast' })).toBeFocused();
});

test('video loads, seeks, persists a checkpoint, and resumes', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/watch/orbit');
  const video = page.locator('video');
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 40000 })
    .toBeGreaterThanOrEqual(1);
  await video.evaluate((v: HTMLVideoElement) => {
    v.pause();
    v.currentTime = 10;
  });
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('afterglow:guest') || '{}').progress?.orbit?.seconds,
      ),
    )
    .toBeGreaterThanOrEqual(10);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Pick up where you left off' })).toBeVisible();
  await page.goto('/watch/orbit');
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 30000 })
    .toBeGreaterThanOrEqual(10);
  await page.getByLabel('Playback speed').selectOption('1.5');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBe(1.5);
});

test('featured rotation can pause and respects reduced motion', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.mouse.move(1400, 950);
  await page.clock.runFor(8500);
  await expect(page.getByRole('heading', { name: 'MIDNIGHT CITY', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause featured rotation' }).click();
  await page.mouse.move(1400, 950);
  await page.clock.runFor(17000);
  await expect(page.getByRole('heading', { name: 'MIDNIGHT CITY', exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.clock.runFor(17000);
  await expect(page.getByRole('heading', { name: 'THE LAST FRONTIER', exact: true })).toBeVisible();
});

test('profile popover dismisses with Escape and shelves stop at boundaries', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Quick profile switch' }).click();
  await expect(page.getByText("Who's watching?", { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Quick profile switch' })).toBeFocused();
  const left = page.getByRole('button', { name: 'Scroll Top 10 Shows left' });
  const right = page.getByRole('button', { name: 'Scroll Top 10 Shows right' });
  await expect(left).toBeDisabled();
  await right.click();
  await expect(left).toBeEnabled();
  await expect(right).toBeDisabled();
});

test('navigation matches browse links and opens language catalog', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav.getByRole('link')).toHaveText([
    'Home',
    'Shows',
    'Movies',
    'Games',
    'New & Popular',
    'My Netflix',
    'Browse by Languages',
  ]);
  await nav.getByRole('link', { name: 'Browse by Languages' }).click();
  await expect(page.getByLabel('Original language')).toHaveValue('English');
  await expect(page.locator('.title-card')).toHaveCount(36);
});
test('title overlay uses the viewport scrollbar instead of a nested panel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Details for Red Dust', exact: true }).first().click();
  const overlay = page.getByRole('dialog', { name: 'Title preview' });
  await expect(overlay).toBeVisible();
  const geometry = await overlay.evaluate((element) => ({
    width: element.clientWidth,
    height: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(geometry.width).toBeGreaterThan(page.viewportSize()!.width - 30);
  expect(geometry.height).toBe(page.viewportSize()!.height);
  expect(geometry.scrollHeight).toBeGreaterThan(geometry.height);
  await expect(page.locator('.related-grid .related-card')).toHaveCount(9);
  await page.keyboard.press('Escape');
  await expect(overlay).toHaveCount(0);
});

test('paging remains clickable after an edge card preview opens', async ({ page }) => {
  await page.goto('/');
  const shelf = page.locator('.ranked-shelf').first();
  const cards = shelf.locator('.title-card');
  const right = shelf.getByRole('button', { name: /right$/ });
  await shelf.scrollIntoViewIfNeeded();
  await cards.nth(5).hover();
  const preview = page.getByRole('region', { name: /Preview of/ });
  await expect(preview).toBeVisible();
  const previewBounds = await preview.boundingBox();
  const arrowBounds = await right.boundingBox();
  expect(previewBounds!.x + previewBounds!.width).toBeLessThan(arrowBounds!.x);
  await right.hover();
  await expect(preview).toHaveCount(0);
  await right.click();
  await expect
    .poll(() => shelf.locator('.shelf-track').evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await expect(right).toBeDisabled();
});

test('scrolled navbar has no divider', async ({ page }) => {
  await page.goto('/');
  await page.locator('.ranked-shelf').first().scrollIntoViewIfNeeded();
  const header = page.locator('header');
  await expect(header).toHaveClass(/scrolled/);
  await expect(header).toHaveCSS('box-shadow', 'none');
  await expect(header).toHaveCSS('border-bottom-width', '0px');
});

test('expanded card replaces its thumbnail and starts a muted video', async ({ page }) => {
  await page.goto('/');
  const card = page
    .locator('.title-card')
    .filter({ has: page.getByRole('link', { name: 'Details for Wild Earth', exact: true }) })
    .first();
  await card.hover();
  const preview = page.getByRole('region', { name: 'Preview of Wild Earth' });
  await expect(preview).toBeVisible();
  await expect(card.locator('.card-image-wrap')).toHaveCSS('opacity', '0');
  const video = preview.locator('video');
  await expect(video).toHaveAttribute('autoplay', '');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.muted)).toBe(true);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), {
      timeout: 30000,
    })
    .toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(preview).toHaveCount(0);
  await expect(card.locator('.card-image-wrap')).toHaveCSS('opacity', '1');
});

test('search clears with Escape and resets filters', async ({ page }) => {
  await page.goto('/search?q=orbit');
  const search = page.getByRole('textbox', { name: 'Search titles, genres, or cast' });
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await page.getByLabel('Genre', { exact: true }).selectOption('Sci-Fi');
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByLabel('Genre', { exact: true })).toHaveValue('All genres');
  await expect(page.locator('.title-card')).toHaveCount(36);
});

test('profile menu supports arrow keys and restores focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Quick profile switch' });
  await trigger.press('ArrowDown');
  await expect(page.getByRole('link', { name: 'Manage profiles' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('link', { name: 'Sign in or create account' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
