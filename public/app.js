const STORAGE_KEY = 'emotional-damage.v1';
const LANGUAGES = ['en', 'de', 'ru'];
const translations = {
  en: {
    eyebrow: 'A MOMENT FOR YOURSELF', question: 'How are you,', really: 'really?',
    zone0: 'Okay', zone1: 'Tired', zone2: 'Overloaded', zone3: 'Exhausted',
    caption0: 'Room to breathe', caption1: 'Running a little low', caption2: 'Everything feels a bit much', caption3: 'Very little energy left',
    gaugeLabel: 'How stressed do you feel right now?', instrument: 'Emotional stress gauge',
    dragHint: 'Move it to match how you feel.', quietNote: 'Just for you. No judgment.',
    infoTitle: 'How it works',
    infoIntro: 'Move the marker to match how you feel. There’s no right answer.',
    description0: 'You have energy, can focus, and enjoy spending time with others.',
    description1: 'Focusing takes effort. You want to finish for the day, but still enjoy other things.',
    description2: 'Small things irritate you. Tasks stay on your mind, and socializing feels like work.',
    description3: 'Even things you enjoy feel draining. Small tasks take effort; you may want to be alone.',
    infoFootnote: 'The descriptions are a rough guide, not a test or medical advice.',
    settingsTitle: 'Settings', languageLabel: 'Language',
    hapticsLabel: 'Haptic feedback', hapticsCaption: 'A light vibration as you move the marker.',
    privacyNote: 'Your last position and settings are saved only in this browser on this device. No account or tracking.',
    storageNote: 'Clearing site data also removes your saved position and settings.',
    installNote: 'On iPhone, open this page in Safari: “Share” → “Add to Home Screen”. After the first online visit, the gauge also works offline.',
    back: 'Back', info: 'About this gauge', settings: 'Settings', close: 'Close',
    position: (zone, step) => `${zone}, position ${step} of 5`,
    storageUnavailable: 'Can’t save in this browser. Your selection will be lost when you reload or close this page.',
  },
  de: {
    eyebrow: 'EIN MOMENT FÜR DICH', question: 'Wie geht’s dir', really: 'wirklich?',
    zone0: 'Gut', zone1: 'Müde', zone2: 'Überlastet', zone3: 'Erschöpft',
    caption0: 'Genug Energie', caption1: 'Die Energie lässt nach', caption2: 'Alles wird zu viel', caption3: 'Kaum noch Kraft',
    gaugeLabel: 'Wie belastet fühlst du dich gerade?', instrument: 'Stressskala',
    dragHint: 'Stell ein, wie es dir gerade geht.', quietNote: 'Nur für dich. Ohne Bewertung.',
    infoTitle: 'So geht’s',
    infoIntro: 'Wähle die Stelle, die zu deinem Gefühl passt. Es gibt kein Richtig oder Falsch.',
    description0: 'Du hast Energie für den Alltag, für andere und für Dinge, die dir guttun.',
    description1: 'Konzentration fällt schwerer. Du möchtest aufhören, hast aber noch Lust auf etwas Schönes.',
    description2: 'Kleinigkeiten nerven. Aufgaben lassen dich nicht los, Gespräche strengen an.',
    description3: 'Selbst Schönes kostet Kraft. Kleine Aufgaben fallen schwer, du möchtest deine Ruhe.',
    infoFootnote: 'Die Beschreibungen dienen zur Orientierung. Kein Test, keine medizinische Beratung.',
    settingsTitle: 'Einstellungen', languageLabel: 'Sprache',
    hapticsLabel: 'Vibration', hapticsCaption: 'Eine leichte Vibration beim Verschieben des Reglers.',
    privacyNote: 'Dein letzter Stand und deine Einstellungen werden nur in diesem Browser auf diesem Gerät gespeichert. Ohne Konto und Tracking.',
    storageNote: 'Wenn du die Websitedaten löschst, gehen auch dein gespeicherter Stand und deine Einstellungen verloren.',
    installNote: 'Auf dem iPhone in Safari: „Teilen“ → „Zu Home-Bildschirm hinzufügen“. Nach dem ersten Laden funktioniert die Skala auch offline.',
    back: 'Zurück', info: 'Über diese Skala', settings: 'Einstellungen', close: 'Schließen',
    position: (zone, step) => `${zone}, Position ${step} von 5`,
    storageUnavailable: 'Speichern nicht möglich. Dein Stand geht beim Neuladen oder Schließen verloren.',
  },
  ru: {
    eyebrow: 'МИНУТА ДЛЯ СЕБЯ', question: 'Как ты', really: 'на самом деле?',
    zone0: 'Хорошо', zone1: 'Усталость', zone2: 'Перегрузка', zone3: 'Истощение',
    caption0: 'Есть силы', caption1: 'Сил становится меньше', caption2: 'Всего слишком много', caption3: 'Сил почти не осталось',
    gaugeLabel: 'Какой у тебя сейчас уровень напряжения?', instrument: 'Шкала напряжения',
    dragHint: 'Отметь, как ты себя чувствуешь.', quietNote: 'Для себя. Без оценок.',
    infoTitle: 'Как это работает',
    infoIntro: 'Отметь на шкале своё состояние. Правильного ответа нет.',
    description0: 'Есть силы на дела, общение и то, что нравится.',
    description1: 'Сложнее сосредоточиться. Хочется закончить дела, но приятные занятия ещё радуют.',
    description2: 'Мелочи раздражают, мысли о делах не отпускают, общаться не хочется.',
    description3: 'Даже приятные занятия утомляют. Простые дела даются с трудом, хочется тишины.',
    infoFootnote: 'Описания — лишь ориентир. Это не тест и не медицинская рекомендация.',
    settingsTitle: 'Настройки', languageLabel: 'Язык',
    hapticsLabel: 'Вибрация', hapticsCaption: 'Лёгкая вибрация при движении ползунка.',
    privacyNote: 'Положение ползунка и настройки сохраняются только в этом браузере на этом устройстве. Без аккаунта и отслеживания.',
    storageNote: 'Если удалить данные сайта, положение ползунка и настройки тоже сбросятся.',
    installNote: 'На iPhone открой страницу в Safari: «Поделиться» → «На экран „Домой“». После первой загрузки шкала работает и без интернета.',
    back: 'Назад', info: 'Об этой шкале', settings: 'Настройки', close: 'Закрыть',
    position: (zone, step) => `${zone}, позиция ${step} из 5`,
    storageUnavailable: 'Не удаётся сохранить. При обновлении или закрытии страницы выбранное положение сбросится.',
  },
};

const browserLanguage = (navigator.languages ?? [navigator.language])
  .map(language => language.split('-')[0].toLowerCase()).find(language => LANGUAGES.includes(language)) ?? 'en';
let storageAvailable = true;
let state = { version: 1, value: 2, language: browserLanguage, haptics: true };

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version !== 1) return;
    if (Number.isInteger(saved.value) && saved.value >= 0 && saved.value <= 19) state.value = saved.value;
    if (LANGUAGES.includes(saved.language)) state.language = saved.language;
    if (typeof saved.haptics === 'boolean') state.haptics = saved.haptics;
  } catch (error) {
    if (!(error instanceof SyntaxError)) storageAvailable = false;
  }
}

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
for (let index = 0; index < 20; index++) {
  const tick = document.createElement('span');
  tick.className = 'tick';
  tick.style.top = `${(index + .5) * 5}%`;
  document.querySelector('#ticks').append(tick);
}

const palette = [
  { at: 0, accent: [151, 199, 123] },
  { at: 4, accent: [178, 199, 122] },
  { at: 9, accent: [224, 188, 112] },
  // Blend through coral across Overloaded, reaching red at Exhausted.
  { at: 15, accent: [255, 105, 115] },
  { at: 19, accent: [255, 77, 90] },
];

function stressAccent(value) {
  const upper = palette.findIndex(stop => stop.at >= value);
  if (upper <= 0) return `rgb(${palette[0].accent.join(', ')})`;
  const low = palette[upper - 1];
  const high = palette[upper];
  const fraction = (value - low.at) / (high.at - low.at);
  return `rgb(${low.accent.map((channel, index) => Math.round(channel + (high.accent[index] - channel) * fraction)).join(', ')})`;
}

function renderSaveNote() {
  saveNote.textContent = translations[state.language][storageAvailable ? 'quietNote' : 'storageUnavailable'];
}

function renderValue() {
  const zone = Math.floor(state.value / 5);
  const text = translations[state.language];
  input.value = state.value;
  input.setAttribute('aria-valuetext', text.position(text[`zone${zone}`], state.value % 5 + 1));
  if (!drag) root.style.setProperty('--position', `${(state.value + .5) * 5}%`);
  root.style.setProperty('--accent', stressAccent(state.value));
  for (const [index, button] of zoneButtons.entries()) {
    button.classList.toggle('selected', index === zone);
    button.setAttribute('aria-pressed', String(index === zone));
  }
}

function renderLanguage() {
  const text = translations[state.language];
  root.lang = state.language;
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = text[element.dataset.i18n];
  for (const [selector, key] of [['#back', 'back'], ['#open-info', 'info'], ['#open-settings', 'settings'], ['#instrument', 'instrument']]) {
    document.querySelector(selector).setAttribute('aria-label', text[key]);
  }
  for (const button of document.querySelectorAll('.close-dialog')) button.setAttribute('aria-label', text.close);
  for (const radio of document.querySelectorAll('[name="language"]')) radio.checked = radio.value === state.language;
  renderValue();
  renderSaveNote();
}

function tick(previousValue) {
  if (!supportsHaptics || !state.haptics || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const now = performance.now();
  if (now - lastTick < 35) return;
  lastTick = now;
  try {
    navigator.vibrate(Math.floor(previousValue / 5) === Math.floor(state.value / 5) ? 6 : 12);
  } catch { /* Vibration is optional, including when disabled by device policy. */ }
}

function setValue(value, withTick = true) {
  const next = Math.max(0, Math.min(19, Math.round(value)));
  if (!Number.isFinite(next) || next === state.value) return;
  const previous = state.value;
  state.value = next;
  renderValue();
  saveState();
  if (withTick) tick(previous);
}

function renderDrag(clientY) {
  if (!drag) return;
  const value = Math.max(0, Math.min(19, (clientY - drag.top - drag.grabOffset) / drag.height * 20 - .5));
  setValue(value);
  // Follow the finger between ticks; the saved/accessibility value stays discrete.
  root.style.setProperty('--position', `${(value + .5) * 5}%`);
  root.style.setProperty('--accent', stressAccent(value));
}

function finishDrag(event) {
  if (!drag || (event && event.pointerId !== drag.pointerId)) return;
  if (dragFrame !== null) cancelAnimationFrame(dragFrame);
  dragFrame = null;
  if (event?.type === 'pointerup') renderDrag(event.clientY);
  else if (pendingDragY !== null) renderDrag(pendingDragY);
  const pointerId = drag.pointerId;
  drag = null;
  pendingDragY = null;
  gauge.classList.remove('dragging');
  renderValue();
  if (input.hasPointerCapture(pointerId)) input.releasePointerCapture(pointerId);
}

// Programmatic range focus can retain :focus-visible after touch or mouse use.
// Hide only the handle's ring for pointer input, keeping native focus intact.
document.addEventListener('pointerdown', () => gauge.classList.add('pointer-input'), { capture: true });
document.addEventListener('keydown', () => gauge.classList.remove('pointer-input'), { capture: true });

instrument.addEventListener('pointerdown', event => {
  if (event.target.closest('button') || drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
  event.preventDefault();
  const bounds = gauge.getBoundingClientRect();
  const grip = handle.getBoundingClientRect();
  // A near miss should still grab the handle without jumping to the finger.
  const padding = 24;
  const onHandle = event.clientX >= grip.left - padding && event.clientX <= grip.right + padding && event.clientY >= grip.top - padding && event.clientY <= grip.bottom + padding;
  drag = {
    pointerId: event.pointerId, top: bounds.top, height: bounds.height,
    grabOffset: onHandle ? event.clientY - (grip.top + grip.height / 2) : 0,
  };
  input.focus({ preventScroll: true });
  input.setPointerCapture(event.pointerId);
  gauge.classList.add('dragging');
  renderDrag(event.clientY);
});
input.addEventListener('pointermove', event => {
  if (event.pointerId !== drag?.pointerId) return;
  pendingDragY = event.clientY;
  // A fast swipe can deliver many samples per display frame. Paint only the
  // latest one, without reading layout or restarting a position animation.
  if (dragFrame === null) dragFrame = requestAnimationFrame(() => {
    dragFrame = null;
    renderDrag(pendingDragY);
  });
});
// Protect the whole instrument, including near misses and the endpoint drawings.
// Start cancellation early; keep level-button taps and dialog scrolling native.
function protectGaugeTouch(event) {
  if (event.cancelable && (event.type === 'touchmove' || !event.target.closest('button'))) event.preventDefault();
  try {
    // Telegram's ordinary in-app browser uses this event for draggable content.
    // The optional, undocumented bridge may be absent or change between versions.
    const bridge = window.TelegramWebviewProxy;
    if (typeof bridge?.postEvent === 'function') bridge.postEvent('cancellingTouch', '{}');
  } catch { /* Host integration must never interrupt the gauge. */ }
}
for (const eventName of ['touchstart', 'touchmove']) {
  instrument.addEventListener(eventName, protectGaugeTouch, { passive: false });
}
for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  input.addEventListener(eventName, finishDrag);
}
window.addEventListener('blur', () => finishDrag());
window.addEventListener('resize', () => finishDrag());
input.addEventListener('input', () => setValue(Number(input.value)));
input.addEventListener('keydown', event => {
  const nextValues = {
    ArrowDown: state.value + 1, ArrowRight: state.value + 1,
    ArrowUp: state.value - 1, ArrowLeft: state.value - 1,
    PageDown: state.value + 5, PageUp: state.value - 5,
    Home: 0, End: 19,
  };
  if (Object.hasOwn(nextValues, event.key)) { event.preventDefault(); setValue(nextValues[event.key]); }
});

for (const button of zoneButtons) button.addEventListener('click', () => setValue(Number(button.dataset.zone) * 5 + 2));
for (const radio of document.querySelectorAll('[name="language"]')) {
  radio.addEventListener('change', () => { state.language = radio.value; renderLanguage(); saveState(); });
}
hapticsInput.addEventListener('change', () => { state.haptics = hapticsInput.checked; saveState(); });
document.querySelector('#haptics-option').hidden = !supportsHaptics;

for (const [trigger, selector] of [['#open-info', '#info-dialog'], ['#open-settings', '#settings-dialog']]) {
  const dialog = document.querySelector(selector);
  document.querySelector(trigger).addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
}

document.querySelector('#back').addEventListener('click', event => {
  // Only use history when an actual previous document is known. A direct or
  // home-screen visit always has a useful homepage fallback.
  if (document.referrer && history.length > 1) { event.preventDefault(); history.back(); }
});

window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  state = { version: 1, value: 2, language: browserLanguage, haptics: true };
  readState();
  hapticsInput.checked = state.haptics;
  renderLanguage();
});

readState();
hapticsInput.checked = state.haptics;
renderLanguage();
// Settle saved styles with startup transitions disabled before revealing the UI.
handle.getBoundingClientRect();
root.classList.remove('starting');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => { /* The gauge works without offline installation. */ });
}
