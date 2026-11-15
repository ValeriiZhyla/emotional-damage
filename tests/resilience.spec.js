import { test, expect } from '@playwright/test';

const KEY = 'emotional-damage.v1';
test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('failed entry script or imports show a usable error view and retry recovers', async ({
  page,
}) => {
  for (const file of ['app.js', 'model.js', 'translations.js']) {
    const pattern = `**/${file}`;
    await page.route(pattern, (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass('failed');
    await expect(page.locator('#load-error')).toBeVisible();
    await expect(page.locator('#instrument')).toBeHidden();
    await expect(page.locator('#open-settings')).toBeDisabled();
    await expect(page.locator('#stress')).toBeDisabled();
    await expect(page.locator('#retry-load')).toBeEnabled();
    await expect(page.locator('#back')).toBeHidden();
    await page.unroute(pattern);
    await page.locator('#retry-load').click();
    await expect(page.locator('#stress')).toBeEnabled();
    await expect(page.locator('#instrument')).toBeVisible();
    await expect(page.locator('#load-error')).toBeHidden();
    await page.locator('.zone[data-zone="3"] .zone-title').click();
    await expect(page.locator('#stress')).toHaveValue('17');
  }
});

test('failure messages follow browser language and fit a small phone', async ({
  browser,
  baseURL,
}) => {
  for (const [language, button] of [
    ['en', 'Try again'],
    ['de', 'Erneut versuchen'],
    ['ru', 'Попробовать снова'],
  ]) {
    const context = await browser.newContext({
      baseURL,
      locale: language,
      serviceWorkers: 'block',
      viewport: { width: 320, height: 568 },
    });
    const page = await context.newPage();
    await page.route('**/app.js', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.getByRole('button', { name: button })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await context.close();
  }
});

test('initialization exceptions reveal the error view without losing saved data', async ({
  page,
}) => {
  const saved = { version: 1, value: 12, language: 'ru', haptics: false };
  await page.addInitScript(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), {
    key: KEY,
    saved,
  });
  await page.route('**/app.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'throw new Error("Injected initialization failure");',
    }),
  );
  await page.goto('/');
  await expect(page.locator('#load-error')).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY)).toEqual(saved);
  await page.unroute('**/app.js');
  await page.locator('#retry-load').click();
  await expect(page.locator('#stress')).toHaveValue('12');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

for (const mode of ['keyboard', 'native input']) {
  test(`${mode} takes over an active drag and survives pointer release`, async ({ page }) => {
    await page.goto('/');
    const handle = await page.locator('#handle').boundingBox();
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    if (mode === 'keyboard') await page.locator('#stress').press('End');
    else
      await page.locator('#stress').evaluate((el) => {
        el.value = '19';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await expect(page.locator('#stress')).toHaveValue('19');
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    await page.mouse.up();
    await expect(page.locator('#stress')).toHaveValue('19');
    await page.reload();
    await expect(page.locator('#stress')).toHaveValue('19');
  });
}

test('a remote value or storage removal supersedes an active drag', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  for (const action of ['value', 'remove']) {
    await page.locator('.zone[data-zone="0"] .zone-title').click();
    const handle = await page.locator('#handle').boundingBox();
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    if (action === 'value') await second.locator('#stress').press('End');
    else await second.evaluate((key) => localStorage.removeItem(key), KEY);
    const expected = action === 'value' ? '19' : '2';
    await expect(page.locator('#stress')).toHaveValue(expected);
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    await page.mouse.up();
    await expect(page.locator('#stress')).toHaveValue(expected);
    if (action === 'remove')
      expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();
    else
      expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).value, KEY)).toBe(
        19,
      );
  }
});

test('opening a modal or hiding the page ends a pending drag cleanly', async ({ page }) => {
  await page.goto('/');
  for (const mode of ['modal', 'hidden']) {
    await page.locator('.zone[data-zone="0"] .zone-title').click();
    const gauge = await page.locator('#gauge').boundingBox();
    const x = gauge.x + gauge.width * 0.74;
    await page.mouse.move(x, gauge.y + gauge.height * 0.125);
    await page.mouse.down();
    await page.mouse.move(x, gauge.y + gauge.height * 0.375);
    await expect(page.locator('#stress')).toHaveValue('7');
    if (mode === 'modal') {
      await page.locator('#open-info').press('Enter');
      await expect(page.locator('#info-dialog')).toBeVisible();
    } else
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        delete document.hidden;
      });
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    await page.mouse.up();
    if (mode === 'modal') await page.keyboard.press('Escape');
    await expect(page.locator('#stress')).toHaveValue('7');
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).value, KEY)).toBe(7);
  }
});

test('the static fallback stays usable without an exit link when scripting is disabled', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.app')).toBeVisible();
  await expect(page.locator('noscript p')).toBeVisible();
  await expect(page.locator('#back')).toBeHidden();
  await context.close();
});
