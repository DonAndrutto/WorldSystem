# System Świata

Polska lokalizacja aplikacji WorldSystem: interaktywnego modelu kosmologii Abhidharmy, trzydziestosiedmioczęściowego ofiarowania mandali oraz planszowej „Gry odrodzenia”.

## Język interfejsu

Otwórz **Opcje → Język → Polski**. Wybór jest zapisywany lokalnie na urządzeniu. Nazwy tybetańskie pozostają osobnym przełącznikiem, więc można używać polskiego interfejsu razem z nazwami tybetańskimi.

Polska warstwa obejmuje:

- menu, podpowiedzi, ustawienia, nawigację i komunikaty dostępności;
- indeks kosmologii, opisy elementów modelu i nazwy wszystkich 104 pól planszy;
- sterowanie mandalą, recytacją i zwiedzaniem 37 kopczyków;
- planszę gry, konfigurację graczy, rzuty, pułapki, dziennik ruchów i komunikaty zwycięstwa;
- działanie offline: pakiet językowy jest dołączany do pamięci podręcznej service workera.

Angielski pozostaje językiem domyślnym i źródłowym. Nazwy sanskryckie, tybetańskie oraz cytowania bibliograficzne zachowują oryginalną postać, aby polska wersja nie odrywała terminów od tekstów, na których opiera się model.

## Terminologia

Przekład używa m.in. „sfery pragnienia”, „sfery formy”, „sfery bezforemnej”, „jodźany”, „kalpy”, „pretów”, „jakszów”, „nagów”, „asurów”, „śrawaków” i „pratjekabuddhów”. Tam, gdzie polskie odpowiedniki mogą sugerować zbyt wiele, termin sanskrycki pozostaje w nawiasie.

## Rozwój

Pakiet znajduje się w `locales/pl.js`. Po jego zmianie uruchom:

```bash
node scripts/build-sw.cjs
```

aby zaktualizować wersję pamięci podręcznej offline.
