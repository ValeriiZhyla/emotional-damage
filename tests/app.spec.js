import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const KEY = 'emotional-damage.v1';
const titles = {
  en: ['Okay', 'Tired', 'Overloaded', 'Exhausted'],
  de: ['Gut', 'Müde', 'Überlastet', 'Erschöpft'],
  ru: ['Хорошо', 'Усталость', 'Перегрузка', 'Истощение'],
};

test('all 20 pointer positions select the correct zone and survive a new page', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const gauge = await page.locator('#gauge').boundingBox();
  for (let value = 0; value < 20; value++) {
    await page.mouse.click(gauge.x + gauge.width * .74, gauge.y + gauge.height * (value + .5) / 20);
    await expect(page.locator('#stress')).toHaveValue(String(value));
    await expect(page.locator('.zone.selected .zone-title')).toHaveText(titles.en[Math.floor(value / 5)]);
  }
  const second = await context.newPage();
  await second.goto('/');
  await expect(second.locator('#stress')).toHaveValue('19');
  expect(errors).toEqual([]);
});

test('dragging tracks the pointer and clamps at both ends', async ({ page }) => {
  await page.goto('/');
  const bounds = await page.locator('#gauge').boundingBox();
  const x = bounds.x + bounds.width * .74;
  await page.mouse.move(x, bounds.y + bounds.height * .125);
  await page.mouse.down();
  await page.mouse.move(x, bounds.y + bounds.height + 60, { steps: 12 });
  await expect(page.locator('#stress')).toHaveValue('19');
  await page.mouse.move(x, bounds.y - 30, { steps: 12 });
  await expect(page.locator('#stress')).toHaveValue('0');
  await page.mouse.up();
  await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
});

test('touch can set the gauge without scrolling the screen', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch interaction is covered by the mobile WebKit project.');
  await page.goto('/');
  const bounds = await page.locator('#gauge').boundingBox();
  await page.touchscreen.tap(bounds.x + bounds.width * .74, bounds.y + bounds.height * .875);
  await expect(page.locator('#stress')).toHaveValue('17');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('keyboard direction, boundaries and accessible value match the vertical scale', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByRole('slider');
  await slider.focus();
  await slider.press('ArrowDown');
  await expect(slider).toHaveValue('3');
  await slider.press('PageDown');
  await expect(slider).toHaveValue('8');
  await slider.press('End');
  await expect(slider).toHaveAttribute('aria-valuetext', 'Exhausted, position 5 of 5');
  await slider.press('ArrowDown');
  await expect(slider).toHaveValue('19');
  await slider.press('Home');
  await slider.press('ArrowUp');
  await expect(slider).toHaveValue('0');
});

test('all languages translate labels, info, settings and accessible text, then persist', async ({ page }) => {
  await page.goto('/');
  for (const language of ['de', 'ru', 'en']) {
    await page.locator('#open-settings').click();
    await page.locator(`.language-options label:has(input[value="${language}"])`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('.zone-title')).toHaveText(titles[language]);
    await expect(page.locator('#stress')).toHaveAttribute('aria-valuetext', new RegExp(titles[language][0]));
    await page.locator('#settings-dialog .close-dialog').click();
    await page.locator('#open-info').click();
    await expect(page.locator('#info-dialog h3')).toHaveText(titles[language]);
    expect(await page.locator('#info-dialog [data-i18n="description2"]').textContent()).toBeTruthy();
    await page.locator('#info-dialog .close-dialog').click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
  }
});

test('browser language is the default, an explicit saved language wins', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ locale: 'ru-RU', baseURL });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.locator('#open-settings').click();
  await page.locator('.language-options label:has(input[value="de"])').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await context.close();
});

test('malformed or out-of-range saved data cannot break the app', async ({ page }) => {
  for (const saved of ['{invalid', '{"version":1,"value":500,"language":"xx","haptics":"yes"}', 'null']) {
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: KEY, value: saved });
    await page.goto('/');
    await expect(page.locator('#stress')).toHaveValue('2');
    await page.locator('[data-zone="3"]').click();
    await expect(page.locator('#stress')).toHaveValue('17');
  }
});

test('blocked storage leaves the gauge usable and explains that saving is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/');
  await page.locator('[data-zone="2"]').click();
  await expect(page.locator('#stress')).toHaveValue('12');
  await expect(page.locator('#save-note')).toContainText('Saving is unavailable');
});

test('optional haptics tolerate throwing APIs and hide when unsupported', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true }));
  await page.goto('/');
  await page.locator('#open-settings').click();
  await expect(page.locator('#haptics-option')).toBeHidden();
  await page.locator('#settings-dialog .close-dialog').click();
  await page.evaluate(() => Object.defineProperty(navigator, 'vibrate', { value: () => { throw new Error('Device disabled'); }, configurable: true }));
  await page.locator('[data-zone="3"]').click();
  await expect(page.locator('#stress')).toHaveValue('17');
});

test('haptic preference persists and a blocked vibration cannot interrupt movement', async ({ page }) => {
  await page.addInitScript(() => {
    window.vibrations = [];
    Object.defineProperty(navigator, 'vibrate', { value: value => { window.vibrations.push(value); throw new Error('Unavailable'); }, configurable: true });
  });
  await page.goto('/');
  await page.locator('[data-zone="2"]').click();
  await expect(page.locator('#stress')).toHaveValue('12');
  expect(await page.evaluate(() => window.vibrations)).toEqual([12]);
  await page.locator('#open-settings').click();
  await page.locator('#haptics').uncheck();
  await page.locator('#settings-dialog .close-dialog').click();
  await page.reload();
  await page.locator('[data-zone="3"]').click();
  expect(await page.evaluate(() => window.vibrations)).toEqual([]);
});

test('a second tab follows saved changes', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await page.locator('[data-zone="3"]').click();
  await expect(second.locator('#stress')).toHaveValue('17');
});

test('offline reload retains the complete gauge, selected language and position', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await page.locator('[data-zone="2"]').click();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#stress')).toHaveValue('12');
  await page.locator('[data-zone="1"]').click();
  await expect(page.locator('#stress')).toHaveValue('7');
  await page.locator('#open-settings').click();
  await expect(page.locator('#settings-dialog')).toBeVisible();
  await context.setOffline(false);
});

test('each language fits small phones, tablets, desktop and landscape without page scrolling', async ({ page }) => {
  await page.goto('/');
  for (const language of ['en', 'de', 'ru']) {
    await page.locator('#open-settings').click();
    await page.locator(`.language-options label:has(input[value="${language}"])`).click();
    await page.locator('#settings-dialog .close-dialog').click();
    for (const [width, height] of [[320, 568], [375, 812], [440, 956], [768, 1024], [1440, 900], [956, 440]]) {
      await page.setViewportSize({ width, height });
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, viewWidth: innerWidth, viewHeight: innerHeight }));
      expect(dimensions.width, `${language} ${width}x${height} width`).toBeLessThanOrEqual(dimensions.viewWidth);
      expect(dimensions.height, `${language} ${width}x${height} height`).toBeLessThanOrEqual(dimensions.viewHeight + 1);
      for (const title of await page.locator('.zone-title').all()) {
        expect(await title.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      }
    }
  }
});

test('modals close with Escape, restore focus and respect reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#open-info').click();
  await expect(page.locator('#info-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#info-dialog')).not.toBeVisible();
  await expect(page.locator('#open-info')).toBeFocused();
  const duration = await page.locator('#handle').evaluate(element => getComputedStyle(element).transitionDuration);
  expect(duration).toBe('0s');
});

test('direct launch back button goes to the homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#back')).toHaveAttribute('href', 'https://valeriizhyla.com');
});

test('gauge extremes and both sheets pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const key of ['Home', 'End']) {
    await page.locator('#stress').focus();
    await page.locator('#stress').press(key);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  }
  for (const trigger of ['#open-info', '#open-settings']) {
    await page.locator(trigger).click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.locator('dialog[open] .close-dialog').click();
  }
});
