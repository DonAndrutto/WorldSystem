# System Świata

Polska lokalizacja aplikacji WorldSystem: interaktywnego modelu kosmologii Abhidharmy, trzydziestosiedmioczęściowego ofiarowania mandali oraz planszowej „Gry odrodzenia”.

## Język interfejsu

Otwórz **Opcje → Język → Polski**. Wybór jest zapisywany lokalnie na urządzeniu. Nazwy tybetańskie pozostają osobnym przełącznikiem, więc można używać polskiego interfejsu razem z nazwami tybetańskimi.

Polska warstwa obejmuje:

- menu, podpowiedzi, ustawienia, nawigację i komunikaty dostępności;
- indeks kosmologii, opisy elementów modelu i nazwy pól planszy od 1 do 56;
- sterowanie mandalą, recytacją i zwiedzaniem 37 kopczyków;
- planszę gry, konfigurację graczy, rzuty, pułapki, dziennik ruchów i komunikaty zwycięstwa;
- działanie offline: pakiet językowy jest dołączany do pamięci podręcznej service workera.

Angielski pozostaje językiem domyślnym i źródłowym. Nazwy sanskryckie, tybetańskie oraz cytowania bibliograficzne zachowują oryginalną postać, aby polska wersja nie odrywała terminów od tekstów, na których opiera się model.

## Czego jeszcze brakuje

Pola planszy od 57 do 104 wyświetlają się po angielsku. Pakiet podawał dla nich
nazwy przesunięte względem planszy: pole 59 (Shambhala) nosiło nazwę „Mahajana,
stan arhata”, a pole 97 (Adopting a Physical Form) — „Nirwana”, czyli nazwę pola
104. Na planszy, której pola są celami ruchu, nazwa w języku źródłowym myli mniej
niż nazwa sąsiedniego pola, więc te wpisy usunięto. Lista pól oczekujących na
przekład znajduje się w komentarzu w `locales/pl.js`, a angielskie nazwy —
w `rebirth-board.js`.

## Terminologia

Przekład używa m.in. „sfery pragnienia”, „sfery formy”, „sfery bezforemnej”, „jodźany”, „kalpy”, „pretów”, „jakszów”, „nagów”, „asurów”, „śrawaków” i „pratjekabuddhów”. Tam, gdzie polskie odpowiedniki mogą sugerować zbyt wiele, termin sanskrycki pozostaje w nawiasie.

## Rozwój

Pakiet znajduje się w `locales/pl.js`. Po jego zmianie uruchom:

```bash
node scripts/build-sw.cjs
node tests/localization.mjs
```

Pierwsze polecenie aktualizuje wersję pamięci podręcznej offline. Drugie sprawdza,
że pakiet się zatrzymuje (wpis tłumaczony na sam siebie nie może być zapisywany
z powrotem do strony, bo obserwator zmian zapętla się wtedy na dobre) i że żadne
pole planszy nie nosi nazwy innego pola.
