# System Świata

Polska lokalizacja aplikacji WorldSystem: interaktywnego modelu kosmologii Abhidharmy, trzydziestosiedmioczęściowego ofiarowania mandali, planszowej „Gry odrodzenia” oraz koła życia jako malowanej płaskorzeźby.

## Język interfejsu

Otwórz **Opcje → Język → Polski**. Wybór jest zapisywany lokalnie na urządzeniu. Nazwy tybetańskie pozostają osobnym przełącznikiem, więc można używać polskiego interfejsu razem z nazwami tybetańskimi. Przy polskim interfejsie przełącznik **Nazwy** przestawia się między **PL** a **བོད**, bo nazwy podawane mimochodem są wtedy polskie.

Polska warstwa obejmuje:

- menu, podpowiedzi, ustawienia, nawigację i komunikaty dostępności;
- indeks kosmologii, opisy elementów modelu i nazwy wszystkich 104 pól planszy;
- sterowanie mandalą, recytacją i zwiedzaniem 37 kopczyków wraz z opisami wszystkich
  trzydziestu siedmiu ofiarowań, podpowiedziami zwiedzania i opisami malowanych ilustracji;
- tekst trzydziestosiedmioczęściowego ofiarowania — każdy wers, który coś znaczy;
- planszę gry, konfigurację graczy, rzuty, pułapki, dziennik ruchów i komunikaty zwycięstwa;
- koło życia (bhawaczakrę) jako malowaną płaskorzeźbę — wszystkie dziewięćdziesiąt dwa
  hasła, od piasty po Jamę i sferę poza kołem, wraz z podpowiedzią przy najechaniu na
  każdą część i miejscem koła w indeksie;
- działanie offline: pakiet językowy jest dołączany do pamięci podręcznej service workera.

Angielski pozostaje językiem domyślnym i źródłowym. Nazwy sanskryckie, tybetańskie oraz cytowania bibliograficzne zachowują oryginalną postać, aby polska wersja nie odrywała terminów od tekstów, na których opiera się model.

## Do przejrzenia

Przekład jest kompletny: interfejs, indeks kosmologii, nazwy wszystkich 104 pól
oraz opisy pól wraz z cytowanymi strofami. Do decyzji tłumacza pozostają:

- **Złożenia z *kāya***. Oddane w formie spolszczonej i odmienianej, pisanej
  wielką literą: Dharmakāja, Sambhogakāja, Nirmāṇakāja — z odmianą według
  przypadka (Dharmakāji, Sambhogakāją, Nirmāṇakāję). Pola 92 i 93 noszą
  nazwy Wielka Sambhogakāja i Wielka Dharmakāja.
- **Vidyādhara**. W nazwach pól „Trzymający Wiedzę”, w opisach „widjadhara”.
- **Nazwy 34 pól**, dla których powstały dwa równie możliwe warianty.
- **Kṣānti** — „cierpliwość” (pola 57, 63) wobec „receptywności” w opisach.
- **Zapis fonetyczny tybetańskiego** pod wersami ofiarowania pozostaje w konwencji
  angielskiej („zhi yongsu dakpa…”). Polska transkrypcja byłaby osobną decyzją
  redakcyjną i nie została tu podjęta. Mantry sanskryckie i transliteracja Wyliego
  zostają bez zmian.
- **„Holds” i „Held by”** w tabeli haseł koła życia — dwie angielskie etykiety już
  zajęte przez inne znaczenie gdzie indziej w pakiecie („Zawiera”, „Mieszkańcy”) —
  wracają w tych samych brzmieniach przy sześciu mędrcach i przy Jamie trzymającym
  koło, choć sens jest tam inny (trzyma, a nie zawiera). Poprawka wymagałaby zmiany
  nazw pól w `wheel-notes.js`, więc pozostawiono to tłumaczowi do oceny.
- **Cztery gołe nazwy barw** („white”, „green”, „blue”, „red”) użyte przy sześciu
  mędrcach dziedziczą rodzaj żeński nadany im wcześniej przez nazwy kontynentów
  („biała”, „zielona”, „błękitna”, „czerwona”), choć przy postaci mędrca pasowałby
  rodzaj męski. Ten sam powód co wyżej: pole w tabeli nie niesie żadnego kontekstu
  poza samym słowem.

Wcześniejsza wersja pakietu podawała dla pól 57–104 nazwy przesunięte względem
planszy: pole 59 (Shambhala) nosiło nazwę „Mahajana, stan arhata”, a pole 97 —
„Nirwana”, czyli nazwę pola 104. Te wpisy usunięto i zastąpiono nowymi.

## Terminologia

Przekład używa m.in. „sfery pragnienia”, „sfery formy”, „sfery bezforemnej”, „jodźany”, „kalpy”, „pretów”, „jakszów”, „nagów”, „asurów”, „śrawaków” i „pratjekabuddhów”. Tam, gdzie polskie odpowiedniki mogą sugerować zbyt wiele, termin sanskrycki pozostaje w nawiasie.

## Rozwój

Pakiet dzieli się na dwa pliki. `locales/pl.js` zawiera interfejs, nazwy pól
i wzorce zdań składanych z fragmentów; wczytuje się zawsze. `locales/pl-texts.js`
zawiera długie teksty — opisy 104 pól, haseł kosmologii i podpowiedzi zwiedzania
mandali — i pobierany jest dopiero po wybraniu polskiego, żeby czytający po
angielsku nie ściągał kilkuset kilobajtów, których nie zobaczy.

Oba pliki dzielą się na część pisaną ręcznie i część składaną z arkuszy. Skrypt
budujący zapisuje tylko to, co stoi między oznaczonymi liniami; reszta — między
innymi podpowiedzi zwiedzania, które żyją w `mandala-tour.js`, a nie w arkuszu,
oraz cała warstwa koła życia, której hasła żyją w `wheel-notes.js` — zostaje
nienaruszona. W `locales/pl.js` ręczna tabela stoi po tabeli składanej i ma
nad nią pierwszeństwo.

Arkusze tłumacza (trzy kolumny rozdzielone tabulatorem: rodzaj, angielski,
polski) scala się do pakietu poleceniem:

```bash
node scripts/build-locale.cjs <katalog-z-arkuszami>
node scripts/build-sw.cjs
node tests/localization.mjs
```

Pierwsze polecenie wpisuje przekłady między oznaczone linie w obu plikach
pakietu, sprawdzając przy tym, że znaczniki HTML w przekładzie zgadzają się
ze źródłem, że nazwa pola odpowiada jego numerowi na planszy i że żadne pole
nie nosi nazwy innego pola. Wiersze, które tego nie przechodzą, są pomijane
i wypisywane. Drugie aktualizuje wersję pamięci podręcznej offline. Trzecie
sprawdza, że pakiet się zatrzymuje (wpis tłumaczony na sam siebie nie może być
zapisywany z powrotem do strony, bo obserwator zmian zapętla się wtedy na
dobre) i że nic w grze nie mówi o graczu w czasie przeszłym.
