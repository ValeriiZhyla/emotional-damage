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
  const handle = await page.locator('#handle').boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  for (let value = 0; value < 20; value++) {
    await page.mouse.move(gauge.x + gauge.width * .74, gauge.y + gauge.height * (value + .5) / 20);
    await expect(page.locator('#stress')).toHaveValue(String(value));
    await expect(page.locator('.zone.selected .zone-title')).toHaveText(titles.en[Math.floor(value / 5)]);
  }
  await page.mouse.up();
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

test('fast reversals follow the pointer within a frame and settle on release', async ({ page }) => {
  await page.goto('/');
  const gauge = await page.locator('#gauge').boundingBox();
  const handle = await page.locator('#handle').boundingBox();
  const x = handle.x + handle.width / 2;
  await page.mouse.move(x, handle.y + handle.height / 2);
  await page.mouse.down();
  for (const fraction of [.84, .18, .91, .36, .63]) {
    const y = gauge.y + gauge.height * fraction;
    await page.mouse.move(x, y);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const grip = await page.locator('#handle').boundingBox();
    expect(Math.abs(grip.y + grip.height / 2 - y)).toBeLessThan(1.5);
  }
  await page.mouse.up();
  await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
  const value = Number(await page.locator('#stress').inputValue());
  const snappedY = gauge.y + gauge.height * (value + .5) / 20;
  await expect.poll(async () => {
    const grip = await page.locator('#handle').boundingBox();
    return Math.abs(grip.y + grip.height / 2 - snappedY);
  }).toBeLessThan(1);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.locator('#stress')).toHaveValue(String(value));
});

test('grabbing the edge of the handle preserves the contact point', async ({ page }) => {
  await page.goto('/');
  const grip = await page.locator('#handle').boundingBox();
  const x = grip.x + grip.width / 2;
  const y = grip.y + grip.height - 6;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await expect(page.locator('#stress')).toHaveValue('2');
  const unchanged = await page.locator('#handle').boundingBox();
  expect(Math.abs(unchanged.y - grip.y)).toBeLessThan(1);
  await page.mouse.move(x, y + 46);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const moved = await page.locator('#handle').boundingBox();
  expect(Math.abs(moved.y - grip.y - 46)).toBeLessThan(1.5);
  await page.mouse.up();
});

test('release flushes its final point and cancels pending movement', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.querySelector('#stress').addEventListener('pointerdown', event => { window.testPointer = event.pointerId; }, { once: true });
  });
  const gauge = await page.locator('#gauge').boundingBox();
  const x = gauge.x + gauge.width * .74;
  await page.mouse.move(x, gauge.y + gauge.height * .125);
  await page.mouse.down();
  await page.evaluate(({ x, y, height }) => {
    const input = document.querySelector('#stress');
    input.dispatchEvent(new PointerEvent('pointermove', { pointerId: window.testPointer, clientX: x, clientY: y + height * .7 }));
    input.dispatchEvent(new PointerEvent('pointerup', { pointerId: window.testPointer, clientX: x, clientY: y + height * .975 }));
  }, { x, y: gauge.y, height: gauge.height });
  await page.mouse.up();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.locator('#stress')).toHaveValue('19');
  await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).value, KEY)).toBe(19);
});

test('native touch swipes track rapid direction changes and cancel cleanly', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP supplies native touch swipes; mobile WebKit covers shared pointer behavior and native taps.');
  await page.addInitScript(() => {
    window.hostEvents = [];
    window.touchMoves = [];
    window.TelegramWebviewProxy = { postEvent: (name, data) => window.hostEvents.push({ name, data }) };
    document.addEventListener('touchmove', event => window.touchMoves.push(event.defaultPrevented));
  });
  await page.goto('/');
  const session = await page.context().newCDPSession(page);
  const gauge = await page.locator('#gauge').boundingBox();
  const x = gauge.x + gauge.width * .74;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: gauge.y + gauge.height * .125, id: 1 }] });
  for (const fraction of [.9, .1, .8, .25]) {
    const y = gauge.y + gauge.height * fraction;
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] });
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const grip = await page.locator('#handle').boundingBox();
    expect(Math.abs(grip.y + grip.height / 2 - y)).toBeLessThan(2);
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  const moves = await page.evaluate(() => window.touchMoves);
  expect(moves.length).toBeGreaterThan(0);
  expect(moves.every(Boolean)).toBe(true);
  const hostEvents = await page.evaluate(() => window.hostEvents);
  expect(hostEvents).toHaveLength(moves.length + 1); // Cancel from touchstart, before the first move.
  expect(hostEvents.every(event => event.name === 'cancellingTouch' && event.data === '{}')).toBe(true);
  await session.detach();
});

test('embedded gesture protection covers the instrument and tolerates unavailable hosts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.hostEvents = [];
    window.TelegramWebviewProxy = { postEvent: (name, data) => window.hostEvents.push({ name, data }) };
  });
  await page.goto('/');
  // DOM propagation checks complement native Chromium swipes. Synthetic events
  // also cover WebKit without its non-constructible Touch interface.
  const touch = (selector, type = 'touchmove', cancelable = true) => page.locator(selector).first().evaluate((element, { type, cancelable }) => {
    const event = new Event(type, { bubbles: true, cancelable });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  }, { type, cancelable });
  for (const selector of ['#stress', '#instrument', '.heart svg', '.skull svg']) {
    expect(await touch(selector, 'touchstart')).toBe(true);
    expect(await touch(selector)).toBe(true);
  }
  // A button tap retains its click; swiping over it cannot pan the browser.
  expect(await touch('.zone-title', 'touchstart')).toBe(false);
  expect(await touch('.zone-title')).toBe(true);
  expect(await touch('#stress', 'touchmove', false)).toBe(false);
  expect(await page.evaluate(() => window.hostEvents)).toEqual(
    Array.from({ length: 11 }, () => ({ name: 'cancellingTouch', data: '{}' }))
  );
  expect(await touch('h1', 'touchstart')).toBe(false);
  expect(await touch('h1')).toBe(false);
  for (const name of ['info', 'settings']) {
    await page.locator(`#open-${name}`).click();
    expect(await touch(`#${name}-dialog p`, 'touchstart')).toBe(false);
    expect(await touch(`#${name}-dialog p`)).toBe(false);
    await page.locator(`#${name}-dialog .close-dialog`).click();
  }
  expect(await page.evaluate(() => window.hostEvents.length)).toBe(11);
  const gauge = await page.locator('#gauge').boundingBox();
  const x = gauge.x + gauge.width * .74;
  for (const mode of ['missing', 'throwing']) {
    await page.evaluate(mode => {
      if (mode === 'missing') delete window.TelegramWebviewProxy;
      else window.TelegramWebviewProxy = { postEvent() { throw new Error('Host unavailable'); } };
    }, mode);
    await page.mouse.move(x, gauge.y + gauge.height * .5);
    await page.mouse.down();
    expect(await touch('#stress')).toBe(true);
    await page.mouse.move(x, gauge.y + gauge.height * .875);
    await page.mouse.up();
    await expect(page.locator('#stress')).toHaveValue('17');
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).value, KEY)).toBe(17);
    expect(await touch('h1')).toBe(false);
  }
  expect(errors).toEqual([]);
});

test('near misses outside the old input grab the gauge without an initial jump', async ({ page }) => {
  for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.locator('.zone[data-zone="0"] .zone-title').click();
    const gauge = await page.locator('#gauge').boundingBox();
    const input = await page.locator('#stress').boundingBox();
    const grip = await page.locator('#handle').boundingBox();
    const x = input.x + input.width + 6;
    const y = grip.y + grip.height / 2 + 10;
    expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y).id, { x, y })).not.toBe('stress');
    await page.mouse.move(x, y);
    await page.mouse.down();
    await expect(page.locator('#stress')).toHaveValue('2');
    await expect(page.locator('#gauge')).toHaveClass(/dragging/);
    await page.mouse.move(x, y + gauge.height * .5);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const moved = await page.locator('#handle').boundingBox();
    expect(Math.abs(moved.y - grip.y - gauge.height * .5)).toBeLessThan(2);
    await page.mouse.up();
    await expect(page.locator('#stress')).toHaveValue('12');
    // Resizing must end a captured near-miss drag without leaving a pending frame.
    await page.mouse.move(x, gauge.y + gauge.height * .875);
    await page.mouse.down();
    await page.setViewportSize({ width: viewport.width, height: viewport.height - 20 });
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    await page.mouse.up();
    // The protected area does not intercept actual level buttons.
    for (const zone of [0, 3, 1, 2]) {
      await page.locator(`.zone[data-zone="${zone}"] .zone-title`).click();
      await expect(page.locator('#stress')).toHaveValue(String(zone * 5 + 2));
      await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    }
  }
});

test('native swipes starting beside the slider or on its drawings stay protected', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP supplies native swipes; WebKit covers taps and event propagation.');
  await page.addInitScript(() => {
    window.hostEvents = [];
    window.touchEvents = [];
    window.TelegramWebviewProxy = { postEvent: (name, data) => window.hostEvents.push({ name, data }) };
    for (const type of ['touchstart', 'touchmove']) document.addEventListener(type, event => {
      window.touchEvents.push({ type, prevented: event.defaultPrevented });
    });
  });
  await page.goto('/');
  // Make scrolling possible so zero movement proves protection rather than
  // merely the normal one-screen layout. Touches outside must still scroll.
  await page.evaluate(() => {
    document.body.style.overflow = 'auto';
    const spacer = document.createElement('div');
    spacer.style.height = '100vh';
    document.body.append(spacer);
  });
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeGreaterThan(300);
  const session = await page.context().newCDPSession(page);
  const gauge = await page.locator('#gauge').boundingBox();
  const input = await page.locator('#stress').boundingBox();
  const heart = await page.locator('.heart').boundingBox();
  const skull = await page.locator('.skull').boundingBox();
  const label = await page.locator('.zone-title').first().boundingBox();
  const starts = [
    { x: input.x + input.width + 8, y: gauge.y + gauge.height * .5 },
    { x: heart.x + heart.width / 2, y: heart.y + heart.height / 2 },
    { x: skull.x + skull.width / 2, y: skull.y + skull.height / 2 },
    { x: label.x + 10, y: label.y + label.height / 2, button: true },
  ];
  for (const start of starts) {
    await page.evaluate(() => { window.touchEvents = []; window.hostEvents = []; });
    const point = { x: start.x, y: start.y, id: 1 };
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    for (const offset of [35, -35, 50]) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, y: start.y + offset }] });
    }
    if (!start.button) await expect(page.locator('#gauge')).toHaveClass(/dragging/);
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    const events = await page.evaluate(() => window.touchEvents);
    expect(events[0]).toEqual({ type: 'touchstart', prevented: !start.button });
    const moves = events.filter(event => event.type === 'touchmove');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every(event => event.prevented)).toBe(true);
    expect(await page.evaluate(() => window.hostEvents.length)).toBe(events.length);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  }
  const heading = await page.locator('h1').boundingBox();
  const outside = { x: heading.x + 30, y: heading.y + heading.height - 5, id: 1 };
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [outside] });
  for (const offset of [-25, -50, -80]) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...outside, y: outside.y + offset }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(20);
  await session.detach();
});

test('touch can set the gauge without scrolling the screen', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch interaction is covered by the mobile WebKit project.');
  await page.goto('/');
  const bounds = await page.locator('#gauge').boundingBox();
  const input = await page.locator('#stress').boundingBox();
  await page.touchscreen.tap(input.x + input.width + 8, bounds.y + bounds.height * .875);
  await expect(page.locator('#stress')).toHaveValue('17');
  for (const zone of [0, 3, 1, 2]) {
    await page.locator(`.zone[data-zone="${zone}"] .zone-title`).tap();
    await expect(page.locator('#stress')).toHaveValue(String(zone * 5 + 2));
  }
  await page.touchscreen.tap(bounds.x + bounds.width * .74, bounds.y + bounds.height * .875);
  await expect(page.locator('#stress')).toHaveValue('17');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('slider focus is visible for keyboard navigation and hidden after pointer interactions', async ({ page, isMobile }) => {
  await page.goto('/');
  const slider = page.locator('#stress');
  const hasOutline = () => page.locator('#handle').evaluate(element => {
    const style = getComputedStyle(element);
    return !['none', 'hidden'].includes(style.outlineStyle) && parseFloat(style.outlineWidth) > 0;
  });
  async function tabToSlider() {
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press('Tab');
      if (await slider.evaluate(element => document.activeElement === element)) return;
    }
    throw new Error('Slider was not reachable with Tab');
  }
  async function pointAt(locator) {
    if (isMobile) await locator.tap();
    else await locator.click();
  }

  await tabToSlider();
  await expect(slider).toBeFocused();
  await expect.poll(hasOutline).toBe(true);

  // Range controls can retain :focus-visible when focused by a pointer handler.
  await pointAt(slider);
  await expect.poll(hasOutline).toBe(false);
  const previous = Number(await slider.inputValue());
  await slider.press(previous === 19 ? 'ArrowUp' : 'ArrowDown');
  await expect(slider).toHaveValue(String(previous === 19 ? 18 : previous + 1));
  await expect.poll(hasOutline).toBe(true);

  await pointAt(page.locator('h1'));
  await expect.poll(hasOutline).toBe(false);
  await tabToSlider();
  await expect(slider).toBeFocused();
  await expect.poll(hasOutline).toBe(true);
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
  await expect(page.locator('#save-note')).toContainText('Can’t save in this browser');
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
    for (const [width, height] of [[320, 568], [375, 812], [440, 956], [768, 1024], [1024, 768], [1280, 720], [1440, 900], [1920, 1080], [956, 440]]) {
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

test('mobile gives the gauge more room and desktop uses a wider two-column layout', async ({ page }) => {
  await page.goto('/');
  for (const [width, height, minimumGauge] of [[375, 812, 380], [440, 956, 480]]) {
    await page.setViewportSize({ width, height });
    const gauge = await page.locator('#gauge').boundingBox();
    expect(gauge.height).toBeGreaterThan(minimumGauge);
    expect((await page.locator('#handle').boundingBox()).height).toBeGreaterThanOrEqual(54);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const intro = await page.locator('.introduction').boundingBox();
  const instrument = await page.locator('.instrument').boundingBox();
  expect(instrument.x).toBeGreaterThan(intro.x + intro.width + 60);
  expect((await page.locator('.app').boundingBox()).width).toBeGreaterThan(1000);
  expect((await page.locator('#gauge').boundingBox()).height).toBeGreaterThan(500);
});

test('both dialogs are centered and fit phone browser heights in every language', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'vibrate', { value: () => true, configurable: true }));
  await page.goto('/');
  for (const language of ['en', 'de', 'ru']) {
    await page.locator('#open-settings').click();
    await page.locator(`.language-options label:has(input[value="${language}"])`).click();
    await page.locator('#settings-dialog .close-dialog').click();
    for (const [width, height] of [[375, 640], [440, 740], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      for (const name of ['info', 'settings']) {
        await page.locator(`#open-${name}`).click();
        const dialog = page.locator(`#${name}-dialog`);
        const bounds = await dialog.boundingBox();
        expect(Math.abs(bounds.y + bounds.height / 2 - height / 2), `${language} ${name} center`).toBeLessThan(1);
        expect(bounds.y).toBeGreaterThanOrEqual(19);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(height - 19);
        expect(await dialog.evaluate(el => el.scrollHeight <= el.clientHeight + 1), `${language} ${name} vertical fit at ${width}x${height}`).toBe(true);
        expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
        await expect(page.locator(`#${name}-title`)).toBeFocused();
        await expect(dialog.locator(`[data-i18n="${name === 'info' ? 'infoFootnote' : 'installNote'}"]`)).toBeInViewport({ ratio: 1 });
        if (name === 'settings') {
          await expect(page.locator('#haptics-option')).toBeVisible();
          const choices = await Promise.all((await dialog.locator('.language-options label').all()).map(label => label.boundingBox()));
          expect(choices.every(choice => Math.abs(choice.y - choices[0].y) < 1 && choice.height >= 44)).toBe(true);
        }
        await dialog.locator('.close-dialog').click();
      }
    }
  }
});

test('short screens and doubled dialog text keep all content reachable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'vibrate', { value: () => true, configurable: true }));
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/');
  await page.locator('#open-settings').click();
  await page.locator('.language-options label:has(input[value="de"])').click();
  await page.locator('#settings-dialog .close-dialog').click();
  // Emulate enlarged text independently of viewport zoom and preserve controls.
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll('.sheet h2, .sheet h3, .sheet p, .sheet legend, .language-choices, .preference-label, .preference-caption')]
      .map(el => [el, parseFloat(getComputedStyle(el).fontSize)]);
    for (const [element, size] of sizes) element.style.fontSize = `${size * 2}px`;
  });
  for (const name of ['info', 'settings']) {
    await page.locator(`#open-${name}`).click();
    const dialog = page.locator(`#${name}-dialog`);
    expect(await dialog.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const last = dialog.locator(`[data-i18n="${name === 'info' ? 'infoFootnote' : 'installNote'}"]`);
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    await page.locator(`#${name}-title`).scrollIntoViewIfNeeded();
    await expect(dialog.locator('.close-dialog')).toBeInViewport({ ratio: 1 });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator(`#open-${name}`)).toBeFocused();
  }
});

test('modals close with Escape, restore focus and respect reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#open-info').click();
  await expect(page.locator('#info-dialog')).toBeVisible();
  await expect(page.locator('#info-title')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#info-dialog .close-dialog')).toBeFocused();
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
