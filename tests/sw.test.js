import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { mock, test } from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../public/sw.js', import.meta.url);
const origin = 'https://stress.example';

function worker({
  network = () => Promise.resolve(new Response('network')),
  cached = new Response('cached'),
  cacheError = false,
  installError = false,
} = {}) {
  const handlers = new Map();
  const timers = new Set();
  const deleted = [];
  const calls = [];
  let precached;
  let claimed = false;
  let signal;
  const context = vm.createContext({
    URL,
    AbortController,
    self: {
      location: { origin },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
      addEventListener: (type, listener) => handlers.set(type, listener),
    },
    caches: {
      open: async () => ({
        addAll: async (paths) => {
          precached = [...paths];
          if (installError) throw new Error('quota');
        },
      }),
      match: async (...args) => {
        calls.push(args);
        if (cacheError) throw new Error('cache unavailable');
        return cached?.clone();
      },
      keys: async () => [
        vm.runInContext('CACHE', context),
        'emotional-damage-shell-old',
        'unrelated-cache',
      ],
      delete: async (key) => {
        deleted.push(key);
        return true;
      },
    },
    fetch: mock.fn((request, options) => {
      signal = options.signal;
      return network(request, options);
    }),
    setTimeout: (fn) => {
      timers.add(fn);
      return fn;
    },
    clearTimeout: (fn) => timers.delete(fn),
  });
  vm.runInContext(readFileSync(sourceUrl, 'utf8'), context, { filename: sourceUrl.pathname });
  return {
    async lifecycle(type) {
      let task;
      handlers.get(type)({
        waitUntil: (promise) => {
          task = promise;
        },
      });
      await task;
    },
    request(path = '/app.js', method = 'GET') {
      let response;
      handlers.get('fetch')({
        request: { url: new URL(path, origin).href, method },
        respondWith: (promise) => {
          response = promise;
        },
      });
      return response;
    },
    expire: () => {
      for (const fn of timers) fn();
    },
    get precached() {
      return precached;
    },
    get claimed() {
      return claimed;
    },
    get aborted() {
      return signal.aborted;
    },
    get timers() {
      return timers.size;
    },
    get networkCalls() {
      return context.fetch.mock.callCount();
    },
    deleted,
    calls,
  };
}

test('installation precaches the complete static shell and fails closed on cache errors', async () => {
  const instance = worker();
  await instance.lifecycle('install');
  for (const path of instance.precached)
    assert(existsSync(new URL(`../public${path}`, import.meta.url)));
  for (const name of readdirSync(new URL('../public', import.meta.url)).filter(
    (name) => name.endsWith('.js') && name !== 'sw.js',
  ))
    assert(instance.precached.includes(`/${name}`));
  assert(instance.precached.includes('/'));
  await assert.rejects(worker({ installError: true }).lifecycle('install'), /quota/);
});

test('activation removes only this app’s old caches and claims its clients', async () => {
  const instance = worker();
  await instance.lifecycle('activate');
  assert.deepEqual(instance.deleted, ['emotional-damage-shell-old']);
  assert.equal(instance.claimed, true);
});

test('a successful network response wins and clears the deadline', async () => {
  const instance = worker();
  assert.equal(await (await instance.request()).text(), 'network');
  assert.equal(instance.timers, 0);
  assert.equal(instance.aborted, false);
  assert.equal(instance.calls[0][0], '/app.js');
  assert(instance.calls[0][1].cacheName.startsWith('emotional-damage-shell-'));
});

test('HTTP errors use the cached shell, but remain real errors if no cache exists', async () => {
  for (const status of [404, 500, 503]) {
    const network = async () => new Response('server error', { status });
    assert.equal(await (await worker({ network }).request()).text(), 'cached');
    assert.equal((await worker({ network, cached: null }).request()).status, status);
  }
});

test('network errors use cache or propagate when the asset is unavailable everywhere', async () => {
  const network = async () => {
    throw new Error('offline');
  };
  const instance = worker({ network });
  assert.equal(await (await instance.request()).text(), 'cached');
  assert.equal(instance.aborted, true);
  await assert.rejects(worker({ network, cached: null }).request(), /offline/);
});

test('a stalled request falls back at the deadline and aborts wasted work', async () => {
  const instance = worker({ network: () => new Promise(() => {}) });
  const result = instance.request();
  instance.expire();
  assert.equal(await (await result).text(), 'cached');
  assert.equal(instance.aborted, true);
  assert.equal(instance.timers, 0);
});

test('without cache, the deadline does not abort a slow but valid first load', async () => {
  let finish;
  const instance = worker({
    cached: null,
    network: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  let settled = false;
  const result = instance.request();
  result.then(() => {
    settled = true;
  });
  instance.expire();
  await new Promise(setImmediate);
  assert.equal(settled, false);
  assert.equal(instance.aborted, false);
  finish(new Response('slow network'));
  assert.equal(await (await result).text(), 'slow network');
  assert.equal(instance.timers, 0);
});

test('cache API failure does not break networking or replace real HTTP errors', async () => {
  assert.equal(await (await worker({ cacheError: true }).request()).text(), 'network');
  const instance = worker({
    cacheError: true,
    network: async () => new Response('error', { status: 500 }),
  });
  assert.equal((await instance.request()).status, 500);
});

test('unrelated paths, non-GET requests and other origins bypass the worker', () => {
  const instance = worker();
  assert.equal(instance.request('/private-data'), undefined);
  assert.equal(instance.request('/app.js', 'POST'), undefined);
  assert.equal(instance.request('https://other.example/app.js'), undefined);
  assert.equal(instance.networkCalls, 0);
  assert.equal(instance.calls.length, 0);
});
