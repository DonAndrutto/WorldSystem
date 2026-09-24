/* Lightweight labels used by presentation controls. The main language pack
 * owns the long application copy; this file keeps the new controls available
 * when it is loaded after the page has already booted. */
(() => {
  const locale = window.WorldSystemLocale;
  locale?.add({
    'Play presentation': 'Odtwarzaj prezentację',
    'Pause presentation': 'Wstrzymaj prezentację',
    'Next stop': 'Następny przystanek',
    'Guided presentation': 'Prezentacja z przewodnikiem',
    'Time per slide': 'Czas na slajd',
    '1.5 seconds': '1,5 sekundy',
    '3 seconds': '3 sekundy',
    '5 seconds': '5 sekund',
    '8 seconds': '8 sekund',
    'Show or hide heap numbers': 'Pokaż lub ukryj numery kopców',
    'End tour': 'Zakończ zwiedzanie',
    'Restart': 'Od początku',
    'Pace': 'Tempo',
    'Go to a stop': 'Przejdź do przystanku',
    'Start a guided tour': 'Rozpocznij zwiedzanie'
  });
})();
