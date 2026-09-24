/* Lightweight labels used by presentation controls. The main language pack
 * owns the long application copy; this file keeps the new controls available
 * when it is loaded after the page has already booted. */
(() => {
  const locale = window.WorldSystemLocale;
  locale?.add({
    'Play presentation': 'Odtwarzaj prezentację',
    'End tour': 'Zakończ zwiedzanie',
    'Restart': 'Od początku',
    'Pace': 'Tempo',
    'Go to a stop': 'Przejdź do przystanku',
    'Start a guided tour': 'Rozpocznij zwiedzanie'
  });
})();
