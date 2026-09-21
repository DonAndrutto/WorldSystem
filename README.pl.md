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

## Czego jeszcze brakuje

Opisy pól planszy i część haseł indeksu są tłumaczone partiami i do czasu
ukończenia wyświetlają się po angielsku. Nazwy wszystkich 104 pól są już gotowe.

Wcześniejsza wersja pakietu podawała dla pól 57–104 nazwy przesunięte względem
planszy: pole 59 (Shambhala) nosiło nazwę „Mahajana, stan arhata”, a pole 97
(Adopting a Physical Form) — „Nirwana”, czyli nazwę pola 104. Te wpisy usunięto
i zastąpiono nowymi.

## Terminologia

Przekład używa m.in. „sfery pragnienia”, „sfery formy”, „sfery bezforemnej”, „jodźany”, „kalpy”, „pretów”, „jakszów”, „nagów”, „asurów”, „śrawaków” i „pratjekabuddhów”. Tam, gdzie polskie odpowiedniki mogą sugerować zbyt wiele, termin sanskrycki pozostaje w nawiasie.

## Rozwój

Pakiet dzieli się na dwa pliki. `locales/pl.js` zawiera interfejs, nazwy pól
i wzorce zdań składanych z fragmentów; wczytuje się zawsze. `locales/pl-texts.js`
zawiera długie teksty — opisy 104 pól i haseł kosmologii — i pobierany jest
dopiero po wybraniu polskiego, żeby czytający po angielsku nie ściągał kilkuset
kilobajtów, których nie zobaczy.

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
