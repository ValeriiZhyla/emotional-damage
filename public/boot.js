// Run before styles or body content can paint their unsaved defaults.
document.documentElement.classList.add('starting');

// Only a visit from the main website gets a route back to it. Keep direct and
// installed launches self-contained; no session flag can leak into a later visit.
window.addEventListener('DOMContentLoaded', () => {
  let fromHome = false;
  try {
    fromHome = new URL(document.referrer).origin === 'https://valeriizhyla.com';
  } catch {
    /* An absent or unavailable referrer is a direct visit. */
  }
  const standalone =
    matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  document.querySelector('#back').hidden = !fromHome || standalone;
});

// load waits for the module and its imports. If initialization failed, give the
// user a usable error view instead of leaving the whole interface hidden.
window.addEventListener('load', () => {
  const root = document.documentElement;
  if (!root.classList.contains('starting')) return;
  const messages = {
    en: ['Couldn’t load the gauge. Please try again.', 'Try again'],
    de: [
      'Die Skala konnte nicht geladen werden. Versuch es bitte noch einmal.',
      'Erneut versuchen',
    ],
    ru: ['Не удалось загрузить шкалу. Попробуй ещё раз.', 'Попробовать снова'],
  };
  const language =
    (navigator.languages ?? [navigator.language])
      .map((value) => value.split('-')[0].toLowerCase())
      .find((value) => Object.hasOwn(messages, value)) ?? 'en';
  root.lang = language;
  document.querySelector('#load-error-message').textContent = messages[language][0];
  const retry = document.querySelector('#retry-load');
  retry.textContent = messages[language][1];
  for (const control of document.querySelectorAll('button, input'))
    control.disabled = control !== retry;
  retry.addEventListener('click', () => location.reload());
  document.querySelector('#load-error').hidden = false;
  root.classList.add('failed');
  root.classList.remove('starting');
});
