import {
  STORAGE_KEY,
  LANGUAGES,
  MAX_VALUE,
  STEPS_PER_ZONE,
  DEFAULT_VALUE,
  defaultState,
  parseState,
  positionPercent,
  stressAccent,
} from './model.js';
import { translations } from './translations.js';

const browserLanguage =
  (navigator.languages ?? [navigator.language])
    .map((language) => language.split('-')[0].toLowerCase())
    .find((language) => LANGUAGES.includes(language)) ?? 'en';
let storageAvailable = true;

function readState() {
  try {
    return parseState(localStorage.getItem(STORAGE_KEY), browserLanguage);
  } catch {
    storageAvailable = false;
    return defaultState(browserLanguage);
  }
}
let state = readState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  renderSaveNote();
}

const root = document.documentElement;
const input = document.querySelector('#stress');
const gauge = document.querySelector('#gauge');
const instrument = document.querySelector('#instrument');
const handle = document.querySelector('#handle');
const zoneButtons = [...document.querySelectorAll('[data-zone]')];
const saveNote = document.querySelector('#save-note');
const hapticsInput = document.querySelector('#haptics');
const supportsHaptics = typeof navigator.vibrate === 'function';
let drag = null;
let dragFrame = null;
let pendingDragY = null;
let lastTick = 0;

// Centers of twenty equally sized steps keep five positions inside every zone.
for (let index = 0; index <= MAX_VALUE; index++) {
  const tick = document.createElement('span');
  tick.className = 'tick';
  tick.style.top = `${positionPercent(index)}%`;
  document.querySelector('#ticks').append(tick);
}

function renderSaveNote() {
  saveNote.textContent =
    translations[state.language][storageAvailable ? 'quietNote' : 'storageUnavailable'];
}

function renderValue() {
  const zone = Math.floor(state.value / STEPS_PER_ZONE);
  const text = translations[state.language];
  input.value = state.value;
  input.setAttribute(
    'aria-valuetext',
    text.position(text[`zone${zone}`], (state.value % STEPS_PER_ZONE) + 1),
  );
  if (!drag) root.style.setProperty('--position', `${positionPercent(state.value)}%`);
  root.style.setProperty('--accent', stressAccent(state.value));
  for (const [index, button] of zoneButtons.entries()) {
    button.classList.toggle('selected', index === zone);
    button.setAttribute('aria-pressed', String(index === zone));
  }
}

function renderLanguage() {
  const text = translations[state.language];
  root.lang = state.language;
  for (const element of document.querySelectorAll('[data-i18n]'))
    element.textContent = text[element.dataset.i18n];
  for (const [selector, key] of [
    ['#back', 'back'],
    ['#github', 'repository'],
    ['#open-info', 'info'],
    ['#open-settings', 'settings'],
    ['#instrument', 'instrument'],
  ]) {
    document.querySelector(selector).setAttribute('aria-label', text[key]);
  }
  for (const button of document.querySelectorAll('.close-dialog'))
    button.setAttribute('aria-label', text.close);
  for (const radio of document.querySelectorAll('[name="language"]'))
    radio.checked = radio.value === state.language;
  renderValue();
  renderSaveNote();
}

function tick(previousValue) {
  if (!supportsHaptics || !state.haptics || matchMedia('(prefers-reduced-motion: reduce)').matches)
    return;
  const now = performance.now();
  if (now - lastTick < 35) return;
  lastTick = now;
  try {
    navigator.vibrate(
      Math.floor(previousValue / STEPS_PER_ZONE) === Math.floor(state.value / STEPS_PER_ZONE)
        ? 6
        : 12,
    );
  } catch {
    /* Vibration is optional, including when disabled by device policy. */
  }
}

function setValue(value) {
  const next = Math.max(0, Math.min(MAX_VALUE, Math.round(value)));
  if (!Number.isFinite(next) || next === state.value) return;
  const previous = state.value;
  state.value = next;
  renderValue();
  saveState();
  tick(previous);
}

function renderDrag(clientY) {
  if (!drag) return;
  const value = Math.max(
    0,
    Math.min(
      MAX_VALUE,
      ((clientY - drag.top - drag.grabOffset) / drag.height) * (MAX_VALUE + 1) - 0.5,
    ),
  );
  setValue(value);
  // Follow the finger between ticks; the saved/accessibility value stays discrete.
  root.style.setProperty('--position', `${positionPercent(value)}%`);
  root.style.setProperty('--accent', stressAccent(value));
}

// Release ownership without committing an old pointer over a newer external value.
function releaseDrag() {
  if (!drag) return;
  if (dragFrame !== null) cancelAnimationFrame(dragFrame);
  dragFrame = null;
  const pointerId = drag.pointerId;
  drag = null;
  pendingDragY = null;
  gauge.classList.remove('dragging');
  renderValue();
  if (input.hasPointerCapture(pointerId)) input.releasePointerCapture(pointerId);
}

function finishDrag(event) {
  if (!drag || (event && event.pointerId !== drag.pointerId)) return;
  if (event?.type === 'pointerup') renderDrag(event.clientY);
  else if (pendingDragY !== null) renderDrag(pendingDragY);
  releaseDrag();
}

// Programmatic range focus can retain :focus-visible after touch or mouse use.
// Hide only the handle's ring for pointer input, keeping native focus intact.
document.addEventListener('pointerdown', () => gauge.classList.add('pointer-input'), {
  capture: true,
});
document.addEventListener('keydown', () => gauge.classList.remove('pointer-input'), {
  capture: true,
});

instrument.addEventListener('pointerdown', (event) => {
  if (
    event.target.closest('button') ||
    drag ||
    !event.isPrimary ||
    (event.pointerType === 'mouse' && event.button !== 0)
  )
    return;
  event.preventDefault();
  const bounds = gauge.getBoundingClientRect();
  if (bounds.height <= 0) return;
  const grip = handle.getBoundingClientRect();
  // A near miss should still grab the handle without jumping to the finger.
  const padding = 24;
  const onHandle =
    event.clientX >= grip.left - padding &&
    event.clientX <= grip.right + padding &&
    event.clientY >= grip.top - padding &&
    event.clientY <= grip.bottom + padding;
  drag = {
    pointerId: event.pointerId,
    top: bounds.top,
    height: bounds.height,
    grabOffset: onHandle ? event.clientY - (grip.top + grip.height / 2) : 0,
  };
  input.focus({ preventScroll: true });
  input.setPointerCapture(event.pointerId);
  gauge.classList.add('dragging');
  renderDrag(event.clientY);
});
input.addEventListener('pointermove', (event) => {
  if (event.pointerId !== drag?.pointerId) return;
  pendingDragY = event.clientY;
  // A fast swipe can deliver many samples per display frame. Paint only the
  // latest one, without reading layout or restarting a position animation.
  if (dragFrame === null)
    dragFrame = requestAnimationFrame(() => {
      dragFrame = null;
      renderDrag(pendingDragY);
    });
});
// Protect the whole instrument, including near misses and the endpoint drawings.
// Start cancellation early; keep level-button taps and dialog scrolling native.
function protectGaugeTouch(event) {
  if (event.cancelable && (event.type === 'touchmove' || !event.target.closest('button')))
    event.preventDefault();
  try {
    // Telegram's ordinary in-app browser uses this event for draggable content.
    // The optional, undocumented bridge may be absent or change between versions.
    const bridge = window.TelegramWebviewProxy;
    if (typeof bridge?.postEvent === 'function') bridge.postEvent('cancellingTouch', '{}');
  } catch {
    /* Host integration must never interrupt the gauge. */
  }
}
for (const eventName of ['touchstart', 'touchmove']) {
  instrument.addEventListener(eventName, protectGaugeTouch, { passive: false });
}
for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  input.addEventListener(eventName, finishDrag);
}
window.addEventListener('blur', () => finishDrag());
window.addEventListener('resize', () => finishDrag());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) finishDrag();
});
input.addEventListener('input', () => {
  const value = Number(input.value);
  finishDrag();
  setValue(value);
});
input.addEventListener('keydown', (event) => {
  finishDrag();
  const nextValues = {
    ArrowDown: state.value + 1,
    ArrowRight: state.value + 1,
    ArrowUp: state.value - 1,
    ArrowLeft: state.value - 1,
    PageDown: state.value + STEPS_PER_ZONE,
    PageUp: state.value - STEPS_PER_ZONE,
    Home: 0,
    End: MAX_VALUE,
  };
  if (Object.hasOwn(nextValues, event.key)) {
    event.preventDefault();
    setValue(nextValues[event.key]);
  }
});

for (const button of zoneButtons)
  button.addEventListener('click', () => {
    finishDrag();
    setValue(Number(button.dataset.zone) * STEPS_PER_ZONE + DEFAULT_VALUE);
  });
for (const radio of document.querySelectorAll('[name="language"]')) {
  radio.addEventListener('change', () => {
    state.language = radio.value;
    renderLanguage();
    saveState();
  });
}
hapticsInput.addEventListener('change', () => {
  state.haptics = hapticsInput.checked;
  saveState();
});
document.querySelector('#haptics-option').hidden = !supportsHaptics;

for (const [trigger, selector] of [
  ['#open-info', '#info-dialog'],
  ['#open-settings', '#settings-dialog'],
]) {
  const dialog = document.querySelector(selector);
  document.querySelector(trigger).addEventListener('click', () => {
    finishDrag();
    dialog.showModal();
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      dialog.close();
  });
}

window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  releaseDrag();
  state = readState();
  hapticsInput.checked = state.haptics;
  renderLanguage();
});

hapticsInput.checked = state.haptics;
renderLanguage();
// Settle saved styles with startup transitions disabled before revealing the UI.
handle.getBoundingClientRect();
root.classList.remove('starting');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    /* The gauge works without offline installation. */
  });
}
