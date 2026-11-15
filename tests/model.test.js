import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  defaultState,
  parseState,
  stressAccent,
  positionPercent,
  LANGUAGES,
  MAX_VALUE,
  STEPS_PER_ZONE,
} from '../public/model.js';
import { translations } from '../public/translations.js';

test('defaults are independent, validate language and tolerate absent or broken storage data', () => {
  assert.deepEqual(defaultState(), { version: 1, value: 2, language: 'en', haptics: true });
  assert.equal(defaultState('unsupported').language, 'en');
  const changed = defaultState('ru');
  changed.value = 19;
  assert.equal(defaultState('ru').value, 2);
  for (const raw of [
    null,
    undefined,
    5,
    {},
    '',
    '{invalid',
    'null',
    '[]',
    'true',
    '"text"',
    '{"version":2,"value":19}',
    '{"version":"1","value":19}',
  ]) {
    assert.deepEqual(parseState(raw, 'de'), defaultState('de'));
  }
});

test('all supported saved values round-trip and only validated fields survive', () => {
  for (const language of LANGUAGES) {
    for (let value = 0; value <= MAX_VALUE; value++) {
      for (const haptics of [false, true]) {
        const state = { version: 1, value, language, haptics };
        assert.deepEqual(parseState(JSON.stringify({ ...state, unwanted: 'ignored' })), state);
      }
    }
  }
  assert.deepEqual(parseState('{"version":1,"value":0,"language":"xx","haptics":false}', 'ru'), {
    version: 1,
    value: 0,
    language: 'ru',
    haptics: false,
  });
  for (const value of [-1, 20, 0.5, '19', null, true]) {
    assert.deepEqual(
      parseState(JSON.stringify({ version: 1, value, language: 'de', haptics: 'true' })),
      { version: 1, value: 2, language: 'de', haptics: true },
    );
  }
  assert.deepEqual(parseState('{"version":1,"__proto__":{"polluted":true}}'), defaultState());
  assert.equal({}.polluted, undefined);
});

test('twenty tick centres stay inside four equally sized zones', () => {
  assert.equal(MAX_VALUE + 1, 4 * STEPS_PER_ZONE);
  for (let value = 0; value <= MAX_VALUE; value++) {
    assert.equal(positionPercent(value), 2.5 + value * 5);
    assert(positionPercent(value) > Math.floor(value / STEPS_PER_ZONE) * 25);
    assert(positionPercent(value) < (Math.floor(value / STEPS_PER_ZONE) + 1) * 25);
  }
  assert.equal(positionPercent(4.5), 25);
});

test('accent interpolation is bounded, gradual and safe for invalid callers', () => {
  assert.equal(stressAccent(0), 'rgb(151, 199, 123)');
  assert.equal(stressAccent(MAX_VALUE), 'rgb(255, 77, 90)');
  assert.equal(stressAccent(-100), stressAccent(0));
  assert.equal(stressAccent(100), stressAccent(MAX_VALUE));
  for (const value of [NaN, Infinity, -Infinity, null, undefined, '12'])
    assert.equal(stressAccent(value), stressAccent(2));
  let previous;
  for (let value = 0; value <= MAX_VALUE; value += 0.25) {
    const channels = stressAccent(value).match(/\d+/g).map(Number);
    assert(channels.every((channel) => channel >= 0 && channel <= 255));
    if (previous)
      assert(Math.max(...channels.map((channel, i) => Math.abs(channel - previous[i]))) <= 4);
    if (value >= 15) assert(channels[0] === 255 && channels[1] <= 105);
    previous = channels;
  }
  assert.notEqual(stressAccent(14.1), stressAccent(14.4));
});

test('locale catalogs agree and English HTML fallbacks match the catalog', () => {
  const keys = Object.keys(translations.en).sort();
  assert.deepEqual(Object.keys(translations), LANGUAGES);
  for (const [language, catalog] of Object.entries(translations)) {
    assert.deepEqual(Object.keys(catalog).sort(), keys, language);
    for (const key of keys) {
      assert.equal(typeof catalog[key], typeof translations.en[key]);
      if (typeof catalog[key] === 'string') assert(catalog[key].trim().length > 0);
    }
    for (let value = 0; value <= MAX_VALUE; value++) {
      const label = catalog[`zone${Math.floor(value / STEPS_PER_ZONE)}`];
      assert(catalog.position(label, (value % STEPS_PER_ZONE) + 1).includes(label));
    }
  }
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  for (const [, key, text] of html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)</g)) {
    assert.equal(normalize(text), normalize(translations.en[key]), key);
  }
});
