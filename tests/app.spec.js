import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const KEY = 'emotional-damage.v1';
const titles = {
  en: ['Okay', 'Tired', 'Overloaded', 'Exhausted'],
  de: ['Gut', 'Müde', 'Überlastet', 'Erschöpft'],
  ru: ['Хорошо', 'Усталость', 'Перегрузка', 'Истощение'],
};

test.describe('saved appearance on opening', () => {
  test.use({ serviceWorkers: 'block' }); // Gate the actual module request on every reload.
  test('slow loading and repeated reloads never reveal the default state or a startup transition', async ({
    page,
  }) => {
    await page.addInitScript((key) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(
          key,
          JSON.stringify({ version: 1, value: 19, language: 'ru', haptics: false }),
        );
      window.visibleFrames = [];
      function frame() {
        const app = document.querySelector('.app');
        const handle = document.querySelector('#handle');
        const gauge = document.querySelector('#gauge');
        if (
          app &&
          handle &&
          gauge &&
          document.styleSheets.length &&
          getComputedStyle(app).visibility === 'visible'
        ) {
          const grip = handle.getBoundingClientRect();
          const bounds = gauge.getBoundingClientRect();
          window.visibleFrames.push({
            value: document.querySelector('#stress').value,
            language: document.documentElement.lang,
            zone: document.querySelector('.zone.selected').dataset.zone,
            color: getComputedStyle(document.querySelector('h1 em')).color,
            fraction: (grip.y + grip.height / 2 - bounds.y) / bounds.height,
            animations: document
              .getAnimations()
              .filter((animation) => animation.playState !== 'finished').length,
          });
        }
        if (window.visibleFrames.length < 8) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }, KEY);
    let release;
    let gate;
    await page.route('**/app.js', async (route) => {
      await gate;
      await route.continue();
    });
    for (const value of [19, 19, 0, 19]) {
      if (page.url() !== 'about:blank')
        await page.locator('#stress').press(value === 0 ? 'Home' : 'End');
      gate = new Promise((resolve) => {
        release = resolve;
      });
      await page.goto('/', { waitUntil: 'commit' });
      await page.locator('.app').waitFor({ state: 'attached' });
      await expect(page.locator('html')).toHaveClass('starting');
      await expect(page.locator('.app')).toHaveCSS('visibility', 'hidden');
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      expect(await page.evaluate(() => window.visibleFrames)).toEqual([]);
      release();
      await expect(page.locator('#stress')).toHaveValue(String(value));
      await expect(page.locator('.app')).toHaveCSS('visibility', 'visible');
      await page.waitForFunction(() => window.visibleFrames.length >= 2);
      for (const frame of await page.evaluate(() => window.visibleFrames)) {
        expect(frame.value).toBe(String(value));
        expect(frame.zone).toBe(String(Math.floor(value / 5)));
        expect(frame.language).toBe('ru');
        expect(frame.color).toBe(value === 19 ? 'rgb(255, 77, 90)' : 'rgb(151, 199, 123)');
        expect(Math.abs(frame.fraction - (value + 0.5) / 20)).toBeLessThan(0.002);
        expect(frame.animations).toBe(0);
      }
    }
  });
});

test('accent changes stay gradual into red and follow movement between ticks', async ({ page }) => {
  await page.goto('/');
  const gauge = await page.locator('#gauge').boundingBox();
  const x = gauge.x + gauge.width * 0.74;
  const handle = await page.locator('#handle').boundingBox();
  await page.mouse.move(x, handle.y + handle.height / 2);
  await page.mouse.down();
  const colors = [];
  const sample = async (value) => {
    await page.mouse.move(x, gauge.y + (gauge.height * (value + 0.5)) / 20);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    return page.evaluate(() => {
      const color = getComputedStyle(document.querySelector('h1 em')).color;
      return {
        color,
        channels: color.match(/[\d.]+/g).map(Number),
        handle: getComputedStyle(document.querySelector('#handle')).borderTopColor,
        label: getComputedStyle(document.querySelector('.zone.selected .zone-title')).color,
      };
    });
  };
  for (let value = 0; value < 20; value++) {
    const color = await sample(value);
    colors.push(color.channels);
    expect(color.handle).toBe(color.color);
    expect(color.label).toBe(color.color);
    if (value >= 15) {
      expect(color.channels[0]).toBe(255);
      expect(color.channels[1]).toBeLessThanOrEqual(105);
    }
  }
  expect(colors[0]).toEqual([151, 199, 123]);
  expect(colors[19]).toEqual([255, 77, 90]);
  for (let index = 1; index < colors.length; index++) {
    expect(
      Math.max(...colors[index].map((channel, i) => Math.abs(channel - colors[index - 1][i]))),
    ).toBeLessThanOrEqual(16);
  }
  // Inside a single saved tick, visual colour still responds to small movements.
  const before = await sample(14.1);
  const after = await sample(14.4);
  await expect(page.locator('#stress')).toHaveValue('14');
  expect(after.color).not.toBe(before.color);
  expect(after.channels[1]).toBeLessThan(before.channels[1]);
  await page.mouse.up();
  await expect(page.locator('#stress')).toHaveValue('14');
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).value, KEY)).toBe(14);
});

test('all 20 pointer positions select the correct zone and survive a new page', async ({
  page,
  context,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const gauge = await page.locator('#gauge').boundingBox();
  const handle = await page.locator('#handle').boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  for (let value = 0; value < 20; value++) {
    await page.mouse.move(
      gauge.x + gauge.width * 0.74,
      gauge.y + (gauge.height * (value + 0.5)) / 20,
    );
    await expect(page.locator('#stress')).toHaveValue(String(value));
    await expect(page.locator('.zone.selected .zone-title')).toHaveText(
      titles.en[Math.floor(value / 5)],
    );
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
  const x = bounds.x + bounds.width * 0.74;
  await page.mouse.move(x, bounds.y + bounds.height * 0.125);
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
  for (const fraction of [0.84, 0.18, 0.91, 0.36, 0.63]) {
    const y = gauge.y + gauge.height * fraction;
    await page.mouse.move(x, y);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const grip = await page.locator('#handle').boundingBox();
    expect(Math.abs(grip.y + grip.height / 2 - y)).toBeLessThan(1.5);
  }
  await page.mouse.up();
  await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
  const value = Number(await page.locator('#stress').inputValue());
  const snappedY = gauge.y + (gauge.height * (value + 0.5)) / 20;
  await expect
    .poll(async () => {
      const grip = await page.locator('#handle').boundingBox();
      return Math.abs(grip.y + grip.height / 2 - snappedY);
    })
    .toBeLessThan(1);
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
    document.querySelector('#stress').addEventListener(
      'pointerdown',
      (event) => {
        window.testPointer = event.pointerId;
      },
      { once: true },
    );
  });
  const gauge = await page.locator('#gauge').boundingBox();
  const x = gauge.x + gauge.width * 0.74;
  await page.mouse.move(x, gauge.y + gauge.height * 0.125);
  await page.mouse.down();
  await page.evaluate(
    ({ x, y, height }) => {
      const input = document.querySelector('#stress');
      input.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: window.testPointer,
          clientX: x,
          clientY: y + height * 0.7,
        }),
      );
      input.dispatchEvent(
        new PointerEvent('pointerup', {
          pointerId: window.testPointer,
          clientX: x,
          clientY: y + height * 0.975,
        }),
      );
    },
    { x, y: gauge.y, height: gauge.height },
  );
  await page.mouse.up();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.locator('#stress')).toHaveValue('19');
  await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).value, KEY)).toBe(19);
});

test('native touch swipes track rapid direction changes and cancel cleanly', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'CDP supplies native touch swipes; mobile WebKit covers shared pointer behavior and native taps.',
  );
  await page.addInitScript(() => {
    window.hostEvents = [];
    window.touchMoves = [];
    window.TelegramWebviewProxy = {
      postEvent: (name, data) => window.hostEvents.push({ name, data }),
    };
    document.addEventListener('touchmove', (event) =>
      window.touchMoves.push(event.defaultPrevented),
    );
  });
  await page.goto('/');
  const session = await page.context().newCDPSession(page);
  const gauge = await page.locator('#gauge').boundingBox();
  const x = gauge.x + gauge.width * 0.74;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: gauge.y + gauge.height * 0.125, id: 1 }],
  });
  for (const fraction of [0.9, 0.1, 0.8, 0.25]) {
    const y = gauge.y + gauge.height * fraction;
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y, id: 1 }],
    });
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
  expect(hostEvents.every((event) => event.name === 'cancellingTouch' && event.data === '{}')).toBe(
    true,
  );
  await session.detach();
});

test('embedded gesture protection covers the instrument and tolerates unavailable hosts', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.hostEvents = [];
    window.TelegramWebviewProxy = {
      postEvent: (name, data) => window.hostEvents.push({ name, data }),
    };
  });
  await page.goto('/');
  // DOM propagation checks complement native Chromium swipes. Synthetic events
  // also cover WebKit without its non-constructible Touch interface.
  const touch = (selector, type = 'touchmove', cancelable = true) =>
    page
      .locator(selector)
      .first()
      .evaluate(
        (element, { type, cancelable }) => {
          const event = new Event(type, { bubbles: true, cancelable });
          element.dispatchEvent(event);
          return event.defaultPrevented;
        },
        { type, cancelable },
      );
  for (const selector of ['#stress', '#instrument', '.heart svg', '.skull svg']) {
    expect(await touch(selector, 'touchstart')).toBe(true);
    expect(await touch(selector)).toBe(true);
  }
  // A button tap retains its click; swiping over it cannot pan the browser.
  expect(await touch('.zone-title', 'touchstart')).toBe(false);
  expect(await touch('.zone-title')).toBe(true);
  expect(await touch('#stress', 'touchmove', false)).toBe(false);
  expect(await page.evaluate(() => window.hostEvents)).toEqual(
    Array.from({ length: 11 }, () => ({ name: 'cancellingTouch', data: '{}' })),
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
  const x = gauge.x + gauge.width * 0.74;
  for (const mode of ['missing', 'throwing']) {
    await page.evaluate((mode) => {
      if (mode === 'missing') delete window.TelegramWebviewProxy;
      else
        window.TelegramWebviewProxy = {
          postEvent() {
            throw new Error('Host unavailable');
          },
        };
    }, mode);
    await page.mouse.move(x, gauge.y + gauge.height * 0.5);
    await page.mouse.down();
    expect(await touch('#stress')).toBe(true);
    await page.mouse.move(x, gauge.y + gauge.height * 0.875);
    await page.mouse.up();
    await expect(page.locator('#stress')).toHaveValue('17');
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).value, KEY)).toBe(17);
    expect(await touch('h1')).toBe(false);
  }
  expect(errors).toEqual([]);
});

test('near misses outside the old input grab the gauge without an initial jump', async ({
  page,
}) => {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.locator('.zone[data-zone="0"] .zone-title').click();
    await page
      .locator('#handle')
      .evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
    const gauge = await page.locator('#gauge').boundingBox();
    const input = await page.locator('#stress').boundingBox();
    const grip = await page.locator('#handle').boundingBox();
    const x = input.x + input.width + 6;
    const y = grip.y + grip.height / 2 + 10;
    expect(
      await page.evaluate(({ x, y }) => document.elementFromPoint(x, y).id, { x, y }),
    ).not.toBe('stress');
    await page.mouse.move(x, y);
    await page.mouse.down();
    await expect(page.locator('#stress')).toHaveValue('2');
    await expect(page.locator('#gauge')).toHaveClass(/dragging/);
    await page.mouse.move(x, y + gauge.height * 0.5);
    await page.evaluate(() => new Promise(requestAnimationFrame));
    const moved = await page.locator('#handle').boundingBox();
    expect(Math.abs(moved.y - grip.y - gauge.height * 0.5)).toBeLessThan(2);
    await page.mouse.up();
    await expect(page.locator('#stress')).toHaveValue('12');
    // Resizing must end a captured near-miss drag without leaving a pending frame.
    await page.mouse.move(x, gauge.y + gauge.height * 0.875);
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

test('native swipes starting beside the slider or on its drawings stay protected', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'CDP supplies native swipes; WebKit covers taps and event propagation.',
  );
  await page.addInitScript(() => {
    window.hostEvents = [];
    window.touchEvents = [];
    window.TelegramWebviewProxy = {
      postEvent: (name, data) => window.hostEvents.push({ name, data }),
    };
    for (const type of ['touchstart', 'touchmove'])
      document.addEventListener(type, (event) => {
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
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
  ).toBeGreaterThan(300);
  const session = await page.context().newCDPSession(page);
  const gauge = await page.locator('#gauge').boundingBox();
  const input = await page.locator('#stress').boundingBox();
  const heart = await page.locator('.heart').boundingBox();
  const skull = await page.locator('.skull').boundingBox();
  const label = await page.locator('.zone-title').first().boundingBox();
  const starts = [
    { x: input.x + input.width + 8, y: gauge.y + gauge.height * 0.5 },
    { x: heart.x + heart.width / 2, y: heart.y + heart.height / 2 },
    { x: skull.x + skull.width / 2, y: skull.y + skull.height / 2 },
    { x: label.x + 10, y: label.y + label.height / 2, button: true },
  ];
  for (const start of starts) {
    await page.evaluate(() => {
      window.touchEvents = [];
      window.hostEvents = [];
    });
    const point = { x: start.x, y: start.y, id: 1 };
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    for (const offset of [35, -35, 50]) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ ...point, y: start.y + offset }],
      });
    }
    if (!start.button) await expect(page.locator('#gauge')).toHaveClass(/dragging/);
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await expect(page.locator('#gauge')).not.toHaveClass(/dragging/);
    const events = await page.evaluate(() => window.touchEvents);
    expect(events[0]).toEqual({ type: 'touchstart', prevented: !start.button });
    const moves = events.filter((event) => event.type === 'touchmove');
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((event) => event.prevented)).toBe(true);
    expect(await page.evaluate(() => window.hostEvents.length)).toBe(events.length);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  }
  const heading = await page.locator('h1').boundingBox();
  const outside = { x: heading.x + 30, y: heading.y + heading.height - 5, id: 1 };
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [outside] });
  for (const offset of [-25, -50, -80]) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ ...outside, y: outside.y + offset }],
    });
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
  await page.touchscreen.tap(input.x + input.width + 8, bounds.y + bounds.height * 0.875);
  await expect(page.locator('#stress')).toHaveValue('17');
  for (const zone of [0, 3, 1, 2]) {
    await page.locator(`.zone[data-zone="${zone}"] .zone-title`).tap();
    await expect(page.locator('#stress')).toHaveValue(String(zone * 5 + 2));
  }
  await page.touchscreen.tap(bounds.x + bounds.width * 0.74, bounds.y + bounds.height * 0.875);
  await expect(page.locator('#stress')).toHaveValue('17');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('slider focus is visible for keyboard navigation and hidden after pointer interactions', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  const slider = page.locator('#stress');
  const hasOutline = () =>
    page.locator('#handle').evaluate((element) => {
      const style = getComputedStyle(element);
      return !['none', 'hidden'].includes(style.outlineStyle) && parseFloat(style.outlineWidth) > 0;
    });
  async function tabToSlider() {
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press('Tab');
      if (await slider.evaluate((element) => document.activeElement === element)) return;
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

test('keyboard direction, boundaries and accessible value match the vertical scale', async ({
  page,
}) => {
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

test('all languages translate labels, info, settings and accessible text, then persist', async ({
  page,
}) => {
  await page.goto('/');
  for (const language of ['de', 'ru', 'en']) {
    await page.locator('#open-settings').click();
    await page.locator(`.language-options label:has(input[value="${language}"])`).click();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('.zone-title')).toHaveText(titles[language]);
    await expect(page.locator('#stress')).toHaveAttribute(
      'aria-valuetext',
      new RegExp(titles[language][0]),
    );
    await page.locator('#settings-dialog .close-dialog').click();
    await page.locator('#open-info').click();
    await expect(page.locator('#info-dialog h3')).toHaveText(titles[language]);
    expect(
      await page.locator('#info-dialog [data-i18n="description2"]').textContent(),
    ).toBeTruthy();
    await page.locator('#info-dialog .close-dialog').click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
  }
});

test('browser language is the default, an explicit saved language wins', async ({
  browser,
  baseURL,
}) => {
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
  for (const saved of [
    '{invalid',
    '{"version":1,"value":500,"language":"xx","haptics":"yes"}',
    'null',
  ]) {
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
      key: KEY,
      value: saved,
    });
    await page.goto('/');
    await expect(page.locator('#stress')).toHaveValue('2');
    await page.locator('[data-zone="3"]').click();
    await expect(page.locator('#stress')).toHaveValue('17');
  }
});

test('blocked storage leaves the gauge usable and explains that saving is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.goto('/');
  await page.locator('[data-zone="2"]').click();
  await expect(page.locator('#stress')).toHaveValue('12');
  await expect(page.locator('#save-note')).toContainText('Can’t save in this browser');
});

test('legacy preferences preserve position and language without haptic controls or API access', async ({
  page,
}) => {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key))
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, value: 14, language: 'de', haptics: true }),
      );
    // Even querying the retired API is unexpected, regardless of browser support.
    window.vibrationAccesses = 0;
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      get() {
        window.vibrationAccesses++;
        throw new Error('The retired vibration API must not be accessed');
      },
    });
  }, KEY);
  await page.goto('/');
  await expect(page.locator('#stress')).toHaveValue('14');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.locator('#open-settings').click();
  await expect(page.getByRole('switch')).toHaveCount(0);
  await expect(page.locator('#settings-dialog input[type="checkbox"]')).toHaveCount(0);
  await page.locator('#settings-dialog .close-dialog').click();
  await page.locator('#stress').press('End');
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY)).toEqual({
    version: 1,
    value: 19,
    language: 'de',
  });
  await page.reload();
  await expect(page.locator('#stress')).toHaveValue('19');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  expect(await page.evaluate(() => window.vibrationAccesses)).toBe(0);
});

test('a second tab follows saved changes', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await page.locator('[data-zone="3"]').click();
  await expect(second.locator('#stress')).toHaveValue('17');
});

test('offline reload retains the complete gauge, selected language and position', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }),
      );
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

test('each language fits small phones, tablets, desktop and landscape without page scrolling', async ({
  page,
}) => {
  await page.goto('/');
  for (const language of ['en', 'de', 'ru']) {
    await page.locator('#open-settings').click();
    await page.locator(`.language-options label:has(input[value="${language}"])`).click();
    await page.locator('#settings-dialog .close-dialog').click();
    for (const [width, height] of [
      [320, 568],
      [375, 812],
      [440, 956],
      [768, 1024],
      [1024, 768],
      [1280, 720],
      [1440, 900],
      [1920, 1080],
      [956, 440],
    ]) {
      await page.setViewportSize({ width, height });
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        viewWidth: innerWidth,
        viewHeight: innerHeight,
      }));
      expect(dimensions.width, `${language} ${width}x${height} width`).toBeLessThanOrEqual(
        dimensions.viewWidth,
      );
      expect(dimensions.height, `${language} ${width}x${height} height`).toBeLessThanOrEqual(
        dimensions.viewHeight + 1,
      );
      for (const title of await page.locator('.zone-title').all()) {
        expect(
          await title.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        ).toBe(true);
      }
    }
  }
});

test('mobile gives the gauge more room and desktop uses a wider two-column layout', async ({
  page,
}) => {
  await page.goto('/');
  for (const [width, height, minimumGauge] of [
    [375, 812, 380],
    [440, 956, 480],
  ]) {
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

for (const language of ['en', 'de', 'ru']) {
  test(`both dialogs are centered and fit phone browser heights in ${language}`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#open-settings').click();
    await page.locator(`.language-options label:has(input[value="${language}"])`).click();
    await page.locator('#settings-dialog .close-dialog').click();
    for (const [width, height] of [
      [375, 640],
      [440, 740],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      for (const name of ['info', 'settings']) {
        await page.locator(`#open-${name}`).click();
        const dialog = page.locator(`#${name}-dialog`);
        const bounds = await dialog.boundingBox();
        expect(
          Math.abs(bounds.y + bounds.height / 2 - height / 2),
          `${language} ${name} center`,
        ).toBeLessThan(1);
        expect(bounds.y).toBeGreaterThanOrEqual(19);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(height - 19);
        expect(
          await dialog.evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
          `${language} ${name} vertical fit at ${width}x${height}`,
        ).toBe(true);
        expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
        await expect(page.locator(`#${name}-title`)).toBeFocused();
        await expect(
          dialog.locator(name === 'info' ? '[data-i18n="infoFootnote"]' : '#github'),
        ).toBeInViewport({ ratio: 1 });
        if (name === 'settings') {
          const choices = await Promise.all(
            (await dialog.locator('.language-options label').all()).map((label) =>
              label.boundingBox(),
            ),
          );
          expect(
            choices.every((choice) => Math.abs(choice.y - choices[0].y) < 1 && choice.height >= 44),
          ).toBe(true);
        }
        await dialog.locator('.close-dialog').click();
      }
    }
  });
}

test('short screens and doubled dialog text keep all content reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/');
  await page.locator('#open-settings').click();
  await page.locator('.language-options label:has(input[value="de"])').click();
  await page.locator('#settings-dialog .close-dialog').click();
  // Emulate enlarged text independently of viewport zoom and preserve controls.
  await page.evaluate(() => {
    const sizes = [
      ...document.querySelectorAll(
        '.sheet h2, .sheet h3, .sheet p, .sheet legend, .language-choices',
      ),
    ].map((el) => [el, parseFloat(getComputedStyle(el).fontSize)]);
    for (const [element, size] of sizes) element.style.fontSize = `${size * 2}px`;
  });
  for (const name of ['info', 'settings']) {
    await page.locator(`#open-${name}`).click();
    const dialog = page.locator(`#${name}-dialog`);
    expect(await dialog.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const last = dialog.locator(name === 'info' ? '[data-i18n="infoFootnote"]' : '#github');
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
  const duration = await page
    .locator('#handle')
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration).toBe('0s');
});

test.describe('entry navigation', () => {
  test.use({ serviceWorkers: 'block' });

  test('Back appears only after entering from the main website, including reloads', async ({
    page,
    baseURL,
  }) => {
    for (const referer of [
      undefined,
      baseURL,
      'https://example.com/',
      'https://links.valeriizhyla.com/',
      'https://valeriizhyla.com.example.com/',
      'http://valeriizhyla.com/',
    ]) {
      await page.goto('/', { referer });
      await expect(page.locator('#back')).toBeHidden();
    }
    // The main site's global policy stays private; only this card shares origin.
    await page.route('https://valeriizhyla.com/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        headers: { 'Referrer-Policy': 'no-referrer' },
        body: `<a href="${baseURL}/" referrerpolicy="origin">Emotional Damage</a>`,
      }),
    );
    await page.goto('https://valeriizhyla.com/?private=omitted');
    await page.getByRole('link', { name: 'Emotional Damage' }).click();
    await page.waitForURL(`${baseURL}/`);
    expect(await page.evaluate(() => document.referrer)).toBe('https://valeriizhyla.com/');
    await expect(page.locator('#back')).toBeVisible();
    await page.reload();
    await expect(page.locator('#back')).toBeVisible();
    await page.locator('#back').click();
    await page.waitForURL('https://valeriizhyla.com/');
    await page.goto('/');
    await expect(page.locator('#back')).toBeHidden();
  });

  test('installed launches hide Back even with a main-site referrer', async ({ context }) => {
    for (const mode of ['display-mode', 'ios']) {
      const page = await context.newPage();
      await page.addInitScript((mode) => {
        if (mode === 'ios') Object.defineProperty(navigator, 'standalone', { value: true });
        else {
          const nativeMatchMedia = window.matchMedia.bind(window);
          window.matchMedia = (query) =>
            query === '(display-mode: standalone)' ? { matches: true } : nativeMatchMedia(query);
        }
      }, mode);
      await page.goto('/', { referer: 'https://valeriizhyla.com/' });
      await expect(page.locator('#instrument')).toBeVisible();
      await expect(page.locator('#back')).toBeHidden();
      await page.close();
    }
  });
});

test('Settings ends with a localized GitHub link that leaves the gauge open', async ({
  page,
  context,
}) => {
  await context.route('https://github.com/ValeriiZhyla/emotional-damage', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Repository</title>',
    }),
  );
  await page.goto('/');
  await page.locator('#open-settings').click();
  const labels = {
    en: 'Source code on GitHub (opens in a new tab)',
    de: 'Quellcode auf GitHub (neuer Tab)',
    ru: 'Исходный код на GitHub (в новой вкладке)',
  };
  const link = page.locator('#github');
  for (const [language, label] of Object.entries(labels)) {
    await page.locator(`.language-options label:has(input[value="${language}"])`).click();
    await expect(link).toHaveAccessibleName(label);
  }
  const bounds = await link.boundingBox();
  expect(bounds.width).toBeGreaterThanOrEqual(44);
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  await link.focus();
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.keyboard.press('Enter')]);
  await popup.waitForLoadState();
  expect(popup.url()).toBe('https://github.com/ValeriiZhyla/emotional-damage');
  expect(await popup.evaluate(() => window.opener)).toBeNull();
  expect(await popup.evaluate(() => document.referrer)).toBe('');
  await expect(page.locator('#settings-dialog')).toBeVisible();
  await expect(page.locator('#stress')).toHaveValue('2');
  await popup.close();
});

test('gauge extremes and both sheets pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const key of ['Home', 'End']) {
    await page.locator('#stress').focus();
    await page.locator('#stress').press(key);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  for (const trigger of ['#open-info', '#open-settings']) {
    await page.locator(trigger).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.locator('dialog[open] .close-dialog').click();
  }
});
