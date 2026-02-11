# Plan implementacji: Wykres 2D i 3D punktów dozowania

---

## ✅ STATUS: Fazy 0-6 zakończone (Wizualizacja 2D z animacją)

Aktualnie zaimplementowana funkcjonalność:
- Parser plików .src i .dat
- Obliczenia pozycji 2D (X, Y)
- Interaktywny wykres 2D z Plotly.js
- Animacja sekwencyjna trajektorii
- Kontrolki: play/pause/restart/speed

---

## Faza 0: Przygotowanie ✅ ZAKOŃCZONA

**Zakres:** Setup projektu, struktura plików, zależności.

| Krok | Opis | Produkt |
|------|------|---------|
| 0.1 | Wybór stacku: Python (matplotlib) vs Next.js (recharts) | Decyzja |
| 0.2 | Inicjalizacja projektu (np. `bun init` / `pyproject.toml`) | package.json / pyproject.toml |
| 0.3 | Dodać `config.json` w głównym katalogu z placeholderami dla BasePoint | `config.json` |
| 0.4 | Ścieżka do `PickAndDrop.src` w config lub jako argument CLI | Konfiguracja |

**Rekomendacja:** Python + matplotlib – mniej ceremonii dla samodzielnego skryptu. Next.js tylko jeśli potrzebna interaktywność w przeglądarce.

---

## Faza 1: Parser `.src` ✅ ZAKOŃCZONA

**Zakres:** Dynamiczne wyciąganie offsetów (X, Y, Z) i powiązań z punktami bazowymi.

| Krok | Opis | Produkt |
|------|------|---------|
| 1.1 | Wyodrębnić bloki `;FOLD dose_A` … `;ENDFOLD` oraz `;FOLD dose_B` … `;ENDFOLD` | Dwie sekcje tekstu |
| 1.2 | W tych blokach wyszukać definicje offsetów: `dose_(A|B)_offset_(\d+)\s*=\s*\{X\s+([-\d.]+),Y\s+([-\d.]+),Z\s+([-\d.]+),A\s+([-\d.]+),B\s+([-\d.]+),C\s+([-\d.]+)\}` | Lista `{name, x, y, z, a, b, c}` |
| 1.3 | W tych samych blokach wyszukać użycie: `PTP\s+(dose_(A|B)_offset_\d+):(Xdose_(A|B)_[12])` (po base mogą być tokeny `C_Dis` itp.) | Mapowanie `offset_name → basePoint` |
| 1.4 | Połączyć definicje z użyciem – tylko te, które występują w `PTP`/`LIN` | Lista `Offset[]` z polami x, y, z |
| 1.5 | Testy jednostkowe na fragmencie `.src` – weryfikacja parsowania X, Y, Z | `test_parser.py` lub `parser.test.ts` |

**Format rzeczywisty (z `PickAndDrop.src`):**
- Definicja: `dose_A_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}`
- Użycie: `PTP dose_A_offset_010:Xdose_A_1  C_Dis` lub `PTP dose_A_offset_020:Xdose_A_1`

**Uwaga:** Parser musi wyciągać współrzędną Z (dotychczas używane tylko X, Y dla 2D).

---

## Faza 2: Parser punktów bazowych z `.dat` ✅ ZAKOŃCZONA

| Krok | Opis | Produkt |
|------|------|---------|
| 2.1 | Parsować `PickAndDrop.dat` i wyciągnąć pozycje `Xdose_A_1`, `Xdose_A_2`, `Xdose_B_1`, `Xdose_B_2` | Parser .dat |
| 2.2 | Format: `GLOBAL E6POS Xdose_A_1={X 17.0,Y 3.0,Z 0.274,...}` → wyciągnąć X, Y i Z | Regex / parser |
| 2.3 | Schema `config.json`: `{ srcPath: "PickAndDrop.src", datPath: "PickAndDrop.dat" }` | Config typu |
| 2.4 | Walidacja Zod – rozszerzyć schemat o pole `z` | Walidator |

**Uwaga:** Parser musi wyciągać również współrzędną Z dla wizualizacji 3D.

---

## Faza 3: Obliczanie pozycji 2D ✅ ZAKOŃCZONA

| Krok | Opis | Produkt |
|------|------|---------|
| 3.1 | Dla każdego `Offset`: `pos.x = base.x + offset.x`, `pos.y = base.y + offset.y` | Lista `OffsetPosition2D[]` |
| 3.2 | Obsłużyć brakujący base – logować warning, pominąć punkt | Bezpieczeństwo |
| 3.3 | Uporządkować dane pod wykres: bases + offset positions z etykietami | Struktura danych dla chart |

---

## Faza 4: Wykres 2D ✅ ZAKOŃCZONA

| Krok | Opis | Produkt |
|------|------|---------|
| 4.1 | Scatter: 4 punkty bazowe (np. kolor: A=niebieski, B=zielony; kształt: 1=○, 2=□) | Warstwa baz |
| 4.2 | Scatter: punkty offsetów (kolor: dose_A vs dose_B, mniejszy marker) | Warstwa offsetów |
| 4.3 | Legenda, osie X/Y (mm), zachowanie proporcji (equal aspect) | Oprawa wykresu |
| 4.4 | Etykiety punktów (opcjonalnie, przy hover lub toggle) | UX |
| 4.5 | Export do PNG/SVG | Output |

---

## Faza 5: Integracja i uruchomienie ✅ ZAKOŃCZONA

| Krok | Opis | Produkt |
|------|------|---------|
| 5.1 | Skrypt CLI: `bun run plot` – czyta `.src`, `config.json`, generuje wykres | Entry point |
| 5.2 | Ścieżka do `.src` możliwa jako argument lub z config | Elastyczność |
| 5.3 | Opcjonalnie: watch mode – przy zmianie `.src` regeneruj wykres | Usprawnienie |

---

## Faza 6: Animacja sekwencyjna trajektorii 2D ✅ ZAKOŃCZONA

**Zakres:** Wizualizacja kolejności wykonywania punktów z liniami łączącymi.

| Krok | Opis | Produkt |
|------|------|---------|
| 6.1 | Wyciągnąć kolejność punktów z `.src` – parsować instrukcje `PTP`/`LIN` w sekcjach dose_A i dose_B | Ordered list punktów |
| 6.2 | Stworzyć strukturę danych dla trajektorii: `{sequence: Point[], timestamp: number}` | Trajectory model |
| 6.3 | Implementacja animacji: punkty i linie pojawiają się stopniowo co 0.5s | Animation engine |
| 6.4 | UI kontrolki: play/pause/restart/speed (0.25x, 0.5x, 1x, 2x) | Animation controls |
| 6.5 | Wizualizacja aktualnego punktu (highlight) i trajektorii (linia łącząca) | Visual feedback |
| 6.6 | Progress bar z numerem kroku (np. "15/60") | UX enhancement |

**Technologia:** Custom implementation z `setInterval` + incremental data update.

**Dane wejściowe:** Uporządkowana lista punktów z parsera (z kolejnością wystąpień w `.src`).

---

## 🚀 FAZA 7: Rozszerzenie o wizualizację 3D (DO WYKONANIA)

**Cel:** Dodanie wykresu 3D i przełącznika widoków przy zachowaniu pełnej funkcjonalności 2D.

---

### Faza 7.1: Rozszerzenie parserów o współrzędną Z

**Zakres:** Aktualizacja istniejących parserów, aby wyciągały współrzędną Z.

| Krok | Opis | Produkt |
|------|------|---------|
| 7.1.1 | **Parser .dat**: Rozszerzyć `datParser.ts` o wyciąganie współrzędnej Z z punktów bazowych | `BasePoint` z polem `z` |
| 7.1.2 | **Parser .src**: Upewnić się, że współrzędna Z offsetów jest parsowana (już jest w kodzie, sprawdzić output) | Offset z polem `z` |
| 7.1.3 | **Typy**: Rozszerzyć `types.ts` o `BasePoint3D` i `OffsetPosition3D` | Nowe typy TypeScript |
| 7.1.4 | **Testy**: Zaktualizować testy parserów – weryfikacja parsowania Z | Testy |
| 7.1.5 | **Walidacja**: Rozszerzyć schematy Zod o pole `z` | Schemat walidacji |

**Ważne:** Nie łamać istniejących funkcjonalności 2D – zachować wsteczną kompatybilność.

---

### Faza 7.2: Obliczanie pozycji 3D

**Zakres:** Dodanie funkcji obliczających pozycje w przestrzeni XYZ.

| Krok | Opis | Produkt |
|------|------|---------|
| 7.2.1 | Nowa funkcja `calculatePositions3D()` w `calculatePositions.ts` | Funkcja 3D |
| 7.2.2 | Logika: `pos.x = base.x + offset.x`, `pos.y = base.y + offset.y`, `pos.z = base.z + offset.z` | Lista `OffsetPosition3D[]` |
| 7.2.3 | Obsługa błędów – brakujące wartości Z | Error handling |
| 7.2.4 | Testy jednostkowe dla obliczeń 3D | `calculatePositions.test.ts` |

**Zasada:** Istniejąca funkcja `calculatePositions()` (2D) pozostaje bez zmian.

---

### Faza 7.3: Generowanie wykresu 3D

**Zakres:** Tworzenie interaktywnego wykresu 3D z Plotly.js.

| Krok | Opis | Produkt |
|------|------|---------|
| 7.3.1 | Nowy plik `src/plotChart3D.ts` | Moduł 3D |
| 7.3.2 | Implementacja `scatter3d` dla punktów bazowych (4 punkty w przestrzeni XYZ) | Warstwa baz 3D |
| 7.3.3 | Implementacja `scatter3d` dla punktów offsetów | Warstwa offsetów 3D |
| 7.3.4 | Konfiguracja osi X/Y/Z (etykiety, jednostki mm) | Setup osi |
| 7.3.5 | Konfiguracja kamery (domyślny kąt, aspect ratio) | Camera config |
| 7.3.6 | Interaktywna rotacja, zoom, pan | Kontrolki 3D |
| 7.3.7 | Hover tooltips z danymi punktów | UX 3D |
| 7.3.8 | Legenda (kolory, kształty) spójna z 2D | Styling |

**Technologia:** Plotly.js `scatter3d` trace type.

**Kolory:** Te same co w 2D (niebieski = dose_A, zielony = dose_B).

---

### Faza 7.4: Przełącznik widoków 2D/3D

**Zakres:** UI do przełączania między wykresami.

| Krok | Opis | Produkt |
|------|------|---------|
| 7.4.1 | Dodać przyciski/toggle "2D / 3D" w HTML | UI control |
| 7.4.2 | Nowy plik `src/viewSwitcher.ts` – logika przełączania | Moduł switcher |
| 7.4.3 | Struktura HTML: dwa `<div>` z wykresami (2D i 3D) | HTML layout |
| 7.4.4 | Logika pokazuj/ukrywaj przez `display: none/block` | Toggle logic |
| 7.4.5 | Stylowanie przełącznika (aktywny widok podświetlony) | CSS styling |
| 7.4.6 | Testy: przełączanie nie łamie wykresów | Testy UI |

**Ważne:** Oba wykresy są renderowane, tylko jeden widoczny na raz.

---

### Faza 7.5: Animacja trajektorii 3D

**Zakres:** Implementacja animacji w przestrzeni 3D.

| Krok | Opis | Produkt |
|------|------|---------|
| 7.5.1 | Nowy plik `src/animation3D.ts` | Moduł animacji 3D |
| 7.5.2 | Trajektoria 3D: linia łącząca punkty w przestrzeni XYZ (`scatter3d` type: 'line') | Trajektoria 3D |
| 7.5.3 | Aktualny punkt: marker 3D (czerwona gwiazda lub podobny) | Current point marker |
| 7.5.4 | Logika animacji: sekwencyjne dodawanie punktów i segmentów linii | Animation loop |
| 7.5.5 | Współdzielenie struktury danych trajektorii z animacją 2D | Data sharing |

**Zasada:** Te same dane trajektorii (`sequence: Point[]`) co dla 2D.

---

### Faza 7.6: Synchronizacja animacji między widokami

**Zakres:** Wspólny stan animacji dla 2D i 3D.

| Krok | Opis | Produkt |
|------|------|---------|
| 7.6.1 | Centralny state manager animacji: `{ isPlaying, currentIndex, speed }` | State object |
| 7.6.2 | Rozszerzyć `src/animation.ts` o obsługę obu widoków | Animation controller |
| 7.6.3 | Wspólne kontrolki: play/pause/restart/speed dla obu widoków | Shared controls |
| 7.6.4 | Wspólny progress bar z licznikiem (np. "15/60") | Shared progress |
| 7.6.5 | Synchronizacja: przełączenie widoku zachowuje pozycję animacji | State persistence |
| 7.6.6 | Testy: animacja działa poprawnie w obu widokach i przy przełączaniu | Testy sync |

**Kluczowe:** Jeden timer, jeden indeks, dwa widoki pokazują ten sam stan.

---

### Faza 7.7: Integracja i testy końcowe

**Zakres:** Połączenie wszystkich komponentów i weryfikacja.

| Krok | Opis | Produkt |
|------|------|---------|
| 7.7.1 | Zaktualizować `index.ts` – wywołanie generowania obu wykresów | Entry point update |
| 7.7.2 | Zaktualizować `plotChart.ts` – generowanie HTML z oboma wykresami | HTML generator |
| 7.7.3 | Testy end-to-end: parsowanie → obliczenia → wykresy 2D/3D → animacja | E2E tests |
| 7.7.4 | Weryfikacja: wszystkie testy przechodzą (istniejące + nowe) | Test suite |
| 7.7.5 | Weryfikacja: istniejąca funkcjonalność 2D działa bez zmian | Regression check |
| 7.7.6 | Zaktualizować README.md – opis nowych funkcji | Dokumentacja |

---

## Kolejność wykonywania

### Fazy zakończone (2D):
```
✅ Faza 0 → Faza 1 → Faza 2 → Faza 3 → Faza 4 → Faza 5 → Faza 6
```

### Faza do wykonania (3D):
```
Faza 7.1 (Parsery Z) → Faza 7.2 (Obliczenia 3D)
                                    ↓
Faza 7.3 (Wykres 3D) → Faza 7.4 (Przełącznik) → Faza 7.5 (Animacja 3D)
                                                        ↓
                                        Faza 7.6 (Synchronizacja) → Faza 7.7 (Integracja)
```

**Zależności Fazy 7:**
- Faza 7.2 zależy od 7.1 (potrzebne dane Z z parserów)
- Faza 7.3 zależy od 7.2 (potrzebne pozycje 3D)
- Faza 7.4 zależy od Fazy 4 (wykres 2D) i 7.3 (wykres 3D)
- Faza 7.5 zależy od 7.3 (potrzebny wykres 3D)
- Faza 7.6 zależy od Fazy 6 (animacja 2D) i 7.5 (animacja 3D)
- Faza 7.7 zależy od wszystkich podfaz (7.1-7.6)

**Możliwe równoległości:**
- Fazy 7.3 i 7.5 można częściowo równolegle (niezależne moduły)
- Testy (7.1.4, 7.2.4) można pisać równolegle z implementacją

---

## Pliki docelowe

### ✅ Istniejące (2D - działające):
```
KukaKlej/
├── .ai/
│   ├── mvp.md                          ← zaktualizowany o 3D
│   ├── plan-implementacji.md           ← ten plik
│   └── completed-phases.md             ← dokumentacja zakończonych faz
├── PickAndDrop.src                     ← plik źródłowy robota KUKA (offsety)
├── PickAndDrop.dat                     ← plik danych robota KUKA (punkty bazowe)
├── config.json                         ← ścieżki do plików .src i .dat
├── config.example.json                 ← szablon config
├── dispensing-points.html              ← interaktywny wykres 2D z animacją
├── src/
│   ├── parser.ts                       ← parser .src (offsety X,Y,Z już parsowane)
│   ├── datParser.ts                    ← parser .dat (punkty bazowe X,Y)
│   ├── calculatePositions.ts           ← obliczanie pozycji 2D
│   ├── plotChart.ts                    ← generowanie wykresu 2D
│   ├── animation.ts                    ← logika animacji 2D
│   └── types.ts                        ← typy TypeScript
└── parser.test.ts                      ← testy
```

### 🚀 Do dodania/modyfikacji (Faza 7 - 3D):

**Nowe pliki:**
```
src/
├── plotChart3D.ts                      ← generator wykresu 3D (Plotly scatter3d)
├── viewSwitcher.ts                     ← logika przełącznika 2D/3D
└── animation3D.ts                      ← animacja trajektorii 3D
```

**Zaktualizowane pliki:**
```
src/
├── datParser.ts                        ← dodać parsing współrzędnej Z
├── calculatePositions.ts               ← dodać funkcję calculatePositions3D()
├── types.ts                            ← dodać BasePoint3D, OffsetPosition3D
├── animation.ts                        ← rozszerzyć o synchronizację z 3D
├── plotChart.ts                        ← zmodyfikować HTML (2 divs: 2D i 3D)
└── calculatePositions.test.ts          ← dodać testy dla 3D
```

**Zaktualizowana dokumentacja:**
```
README.md                               ← dodać opis funkcji 3D i przełącznika
```

**Output:**
```
dispensing-points.html                  ← rozszerzony: 2D + 3D + przełącznik + synchronizowana animacja
```
