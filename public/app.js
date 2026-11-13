const STORAGE_KEY = 'emotional-damage.v1';
const LANGUAGES = ['en', 'de', 'ru'];
const translations = {
  en: {
    eyebrow: 'A MOMENT WITH YOURSELF', question: 'How are you,', really: 'really?',
    zone0: 'Okay', zone1: 'Tired', zone2: 'Overloaded', zone3: 'Exhausted',
    caption0: 'Room to breathe', caption1: 'Running a little low', caption2: 'A bit too much of everything', caption3: 'Very little left to give',
    gaugeLabel: 'How much emotional stress are you feeling?', instrument: 'Emotional stress gauge',
    dragHint: 'Move it to where you are.', quietNote: 'Just a feeling. Yours to notice.',
    aboutEyebrow: 'A SMALL CHECK-IN', infoTitle: 'A little space to notice.',
    infoIntro: 'Move the marker until it feels about right. There is no correct position, and you don’t need to change how you feel.',
    description0: 'There’s some room in your day. You can focus, connect, and enjoy the things you usually enjoy.',
    description1: 'Focusing takes more effort. You’d like to be done for the day, but something pleasant still sounds good.',
    description2: 'Everything seems to ask something of you. Irritation comes easily, tasks keep circling in your head, and company can feel like more work.',
    description3: 'Even enjoyable things can feel demanding. Small actions take a lot, and you may want to be left alone.',
    infoFootnote: 'A reflection toy, not a test or medical advice. These are loose descriptions; your own meaning matters most.',
    settingsEyebrow: 'MAKE YOURSELF AT HOME', settingsTitle: 'Little preferences.', languageLabel: 'Language',
    hapticsLabel: 'Little tactile ticks', hapticsCaption: 'A small vibration as you move.',
    privacyNote: 'Your position and preferences stay in this browser on this device. No account, tracking, or shared history.',
    storageNote: 'Clearing website data clears your saved position too.',
    installNote: 'Keep it close: use your browser’s “Add to Home Screen”. After your first visit, the gauge works offline too.',
    back: 'Back', info: 'About this gauge', settings: 'Settings', close: 'Close',
    position: (zone, step) => `${zone}, position ${step} of 5`,
    storageUnavailable: 'Saving is unavailable here. This moment stays until you close the page.',
  },
  de: {
    eyebrow: 'EIN MOMENT FÜR DICH', question: 'Wie geht’s dir', really: 'wirklich?',
    zone0: 'Gut', zone1: 'Müde', zone2: 'Überlastet', zone3: 'Erschöpft',
    caption0: 'Luft zum Durchatmen', caption1: 'Der Akku wird leer', caption2: 'Von allem etwas zu viel', caption3: 'Kaum noch Kraft übrig',
    gaugeLabel: 'Wie viel emotionale Belastung spürst du gerade?', instrument: 'Skala für emotionale Belastung',
    dragHint: 'Schieb ihn dahin, wo du gerade bist.', quietNote: 'Ein Gefühl. Ein Moment für dich.',
    aboutEyebrow: 'KURZ INNEHALTEN', infoTitle: 'Raum zum Wahrnehmen.',
    infoIntro: 'Verschiebe den Regler, bis es sich ungefähr richtig anfühlt. Es gibt keine richtige Position. Du musst an deinem Gefühl nichts ändern.',
    description0: 'Dein Tag lässt dir etwas Luft. Du kannst dich konzentrieren, Nähe zulassen und Dinge genießen, die dir sonst auch Freude machen.',
    description1: 'Konzentration kostet mehr Mühe. Du wärst gern fertig für heute, aber etwas Schönes klingt noch verlockend.',
    description2: 'Alle scheinen etwas von dir zu wollen. Du bist schneller gereizt, Aufgaben kreisen im Kopf und Gesellschaft fühlt sich nach zusätzlicher Arbeit an.',
    description3: 'Selbst schöne Dinge können sich anstrengend anfühlen. Kleine Handlungen kosten viel Kraft, und du möchtest vielleicht allein sein.',
    infoFootnote: 'Ein Spielzeug zum Innehalten, kein Test und kein medizinischer Rat. Die Beschreibungen sind Anhaltspunkte. Was es für dich bedeutet, zählt am meisten.',
    settingsEyebrow: 'MACH’S DIR GEMÜTLICH', settingsTitle: 'Kleine Vorlieben.', languageLabel: 'Sprache',
    hapticsLabel: 'Kleine spürbare Klicks', hapticsCaption: 'Eine kurze Vibration beim Verschieben.',
    privacyNote: 'Position und Einstellungen bleiben in diesem Browser auf diesem Gerät. Kein Konto, kein Tracking und kein geteilter Verlauf.',
    storageNote: 'Wenn du die Websitedaten löschst, wird auch deine gespeicherte Position gelöscht.',
    installNote: 'Immer griffbereit: im Browser „Zum Home-Bildschirm“ wählen. Nach dem ersten Besuch funktioniert die Skala auch offline.',
    back: 'Zurück', info: 'Über diese Skala', settings: 'Einstellungen', close: 'Schließen',
    position: (zone, step) => `${zone}, Position ${step} von 5`,
    storageUnavailable: 'Speichern ist hier nicht möglich. Dein Stand bleibt, bis du die Seite schließt.',
  },
  ru: {
    eyebrow: 'МИНУТКА ДЛЯ СЕБЯ', question: 'Как ты', really: 'на самом деле?',
    zone0: 'Хорошо', zone1: 'Усталость', zone2: 'Перегрузка', zone3: 'Истощение',
    caption0: 'Есть силы и немного воздуха', caption1: 'Заряд понемногу тает', caption2: 'Всего стало слишком много', caption3: 'Сил почти не осталось',
    gaugeLabel: 'Какую эмоциональную нагрузку ты сейчас ощущаешь?', instrument: 'Шкала эмоциональной нагрузки',
    dragHint: 'Передвинь туда, где ты сейчас.', quietNote: 'Просто чувство. Можно его заметить.',
    aboutEyebrow: 'ПРИСЛУШАТЬСЯ К СЕБЕ', infoTitle: 'Немного места для себя.',
    infoIntro: 'Передвинь ползунок туда, где примерно твое состояние. Правильной позиции нет. И менять свои чувства прямо сейчас не обязательно.',
    description0: 'В течение дня есть немного свободного пространства. Получается сосредоточиться, общаться и получать удовольствие от привычных вещей.',
    description1: 'Сосредоточиться сложнее. Хочется закончить дела на сегодня, но что-нибудь приятное всё ещё привлекает.',
    description2: 'Кажется, все чего-то от тебя хотят. Легче раздражаться, мысли о делах крутятся по кругу, а общение ощущается как ещё одна задача.',
    description3: 'Даже приятные вещи могут казаться нагрузкой. На простые действия уходит много сил, и хочется побыть в одиночестве.',
    infoFootnote: 'Игрушка для рефлексии, а не тест или медицинский совет. Описания приблизительные. Важнее то, что это значит лично для тебя.',
    settingsEyebrow: 'УСТРОЙСЯ ПОУДОБНЕЕ', settingsTitle: 'Маленькие настройки.', languageLabel: 'Язык',
    hapticsLabel: 'Тактильные щелчки', hapticsCaption: 'Лёгкая вибрация при движении.',
    privacyNote: 'Позиция и настройки остаются в этом браузере на этом устройстве. Без аккаунта, отслеживания и общей истории.',
    storageNote: 'При удалении данных сайта сохранённая позиция тоже исчезнет.',
    installNote: 'Держи под рукой: выбери «На экран Домой» в браузере. После первого посещения шкала работает и без интернета.',
    back: 'Назад', info: 'Об этой шкале', settings: 'Настройки', close: 'Закрыть',
    position: (zone, step) => `${zone}, позиция ${step} из 5`,
    storageUnavailable: 'Здесь не получается сохранить. Позиция останется, пока страница открыта.',
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
  { at: 14, accent: [231, 156, 112] },
  // Every Exhausted position is red, starting at the zone boundary.
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

input.addEventListener('pointerdown', event => {
  if (drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
  event.preventDefault();
  const bounds = gauge.getBoundingClientRect();
  const grip = handle.getBoundingClientRect();
  const onHandle = event.clientX >= grip.left && event.clientX <= grip.right && event.clientY >= grip.top && event.clientY <= grip.bottom;
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => { /* The gauge works without offline installation. */ });
}
