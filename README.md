# KUKA Dispensing Points Visualizer

Narzędzie do parsowania i wizualizacji punktów dozowania z plików KUKA (.src, .dat) w formie wykresów 2D i 3D.

## Funkcjonalności

- ✅ **Parser .src**: Dynamiczne wyodrębnianie offsetów `dose_A_offset_*` i `dose_B_offset_*` (X, Y, Z)
- ✅ **Parser .dat**: Automatyczne wyciąganie punktów bazowych 2D i 3D (Xdose_A_1, Xdose_A_2, Xdose_B_1, Xdose_B_2)
- ✅ **Obliczenia 2D i 3D**: Dla każdego offsetu: `pozycja = punkt_bazowy + offset`
- ✅ **Wizualizacja 2D**: Interaktywny wykres płaszczyzny XY z Plotly.js
- ✅ **Wizualizacja 3D**: Interaktywny wykres przestrzeni XYZ z rotacją i zoomem
- ✅ **Przełącznik widoków**: Płynne przełączanie między widokami 2D i 3D
- ✅ **Animacja trajektorii**: Zsynchronizowana wizualizacja kolejności wykonywania punktów w obu widokach
- ✅ **Kontrolki animacji**: Play/Pause/Restart/Speed (0.25x-2x), Progress tracker
- ✅ **Testy**: 30 testów jednostkowych (100% pokrycia, w tym funkcje 3D)

## Wymagania

- [Bun](https://bun.sh) >= 1.0

## Instalacja

```bash
bun install
```

## Konfiguracja

Utwórz plik `config.json` na podstawie `config.example.json`:

```json
{
  "srcPath": "PickAndDrop.src",
  "datPath": "PickAndDrop.dat"
}
```

## Użycie

### Generowanie wykresu

```bash
bun run plot
```

lub

```bash
bun run start
```

Wykres zostanie zapisany do pliku `dispensing-points.html`. Otwórz go w przeglądarce.

### Funkcje w przeglądarce

- **Przełącznik 2D/3D**: Przyciski na górze ekranu pozwalają na przełączanie między widokami
- **Animacja**: Zsynchronizowana w obu widokach - stan animacji zachowuje się przy przełączaniu
- **Kontrolki**: Play/Pause, Restart, prędkość (0.25x, 0.5x, 1x, 2x)
- **Progress bar**: Wizualny wskaźnik postępu (np. "15/60")
- **Interaktywność 3D**: Rotacja (przeciągnij), zoom (scroll), pan (prawy przycisk)

### Uruchamianie testów

```bash
bun test
```

### Testy w trybie watch

```bash
bun run test:watch
```

## Struktura projektu

```
KukaKlej/
├── .ai/
│   ├── mvp.md                          # Specyfikacja MVP
│   ├── plan-implementacji.md           # Plan implementacji
│   └── completed-phases.md             # Dokumentacja zakończonych faz
├── src/
│   ├── parser.ts                       # Parser offsetów z .src (X,Y,Z) + kolejność
│   ├── parser.test.ts                  # Testy parsera .src
│   ├── datParser.ts                    # Parser punktów bazowych z .dat (2D i 3D)
│   ├── calculatePositions.ts           # Obliczanie pozycji 2D i 3D
│   ├── calculatePositions.test.ts      # Testy obliczeń 2D i 3D
│   ├── animation.ts                    # Logika animacji trajektorii 2D i 3D
│   ├── animation.test.ts               # Testy animacji i kolejności
│   ├── plotChart.ts                    # Generowanie HTML z widokami 2D/3D + animacja
│   ├── plotChart3D.ts                  # Generator trace'ów 3D dla Plotly
│   ├── generateOffsetsList.ts          # Generator markdown z listą offsetów
│   └── types.ts                        # Typy TypeScript + schematy Zod
├── PickAndDrop.src                     # Plik źródłowy KUKA (offsety)
├── PickAndDrop.dat                     # Plik danych KUKA (punkty bazowe)
├── config.json                         # Konfiguracja ścieżek
├── config.example.json                 # Przykładowa konfiguracja
├── index.ts                            # Entry point aplikacji
├── parser.test.ts                      # Główne testy integracyjne
├── dispensing-points.html              # Wygenerowany wykres z animacją
├── dispensing-data.json                # Dane w formacie JSON
├── offsets-list.md                     # Lista offsetów w markdown
└── package.json
```

## Jak to działa

### Faza 1: Parsowanie .src

Parser wyszukuje:

1. **Definicje offsetów**:
   ```
   dose_A_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}
   ```

2. **Użycie w instrukcjach PTP/LIN**:
   ```
   PTP dose_A_offset_010:Xdose_A_1  C_Dis
   ```

3. **Powiązanie**: offset → punkt bazowy

### Faza 2: Parsowanie .dat

Parser wyciąga pozycje 2D i 3D punktów bazowych:

```
GLOBAL E6POS Xdose_A_1={X 17.0000,Y 3.00000,Z 0.274462,...}
```

- **2D**: Wyciąga X, Y
- **3D**: Wyciąga X, Y, Z

### Faza 3: Obliczenia 2D i 3D

Dla każdego offsetu:

**2D:**
```typescript
position.x = basePoint.x + offset.x
position.y = basePoint.y + offset.y
```

**3D:**
```typescript
position.x = basePoint.x + offset.x
position.y = basePoint.y + offset.y
position.z = basePoint.z + offset.z
```

### Faza 4: Wizualizacja 2D i 3D

Generowany jest interaktywny wykres HTML z dwoma widokami:

**Widok 2D (płaszczyzna XY):**
- Punkty bazowe: większe markery (○ = pozycja 1, □ = pozycja 2)
- Punkty offsetów: mniejsze markery
- Kolory: niebieski = dose_A, zielony = dose_B

**Widok 3D (przestrzeń XYZ):**
- Punkty bazowe: markery 3D (○ = pozycja 1, □ = pozycja 2)
- Punkty offsetów: mniejsze markery 3D
- Interaktywna rotacja, zoom, pan
- Kamera: domyślny kąt eye(1.5, 1.5, 1.2)

**Wspólne:**
- Hover: szczegóły każdego punktu (X, Y, Z dla 3D)
- Export: możliwość zapisania jako PNG (2x scaling)
- Przełącznik: przyciski "2D View" / "3D View"

### Faza 7: Animacja trajektorii (zsynchronizowana)

Wizualizacja kolejności wykonywania punktów w obu widokach:

- **Trajektoria 2D**: pomarańczowa linia łącząca punkty w płaszczyźnie XY
- **Trajektoria 3D**: pomarańczowa linia 3D w przestrzeni XYZ
- **Aktualny punkt**:
  - 2D: czerwona gwiazda
  - 3D: czerwony diament
- **Synchronizacja**: przełączenie widoku zachowuje pozycję animacji
- **Kontrolki** (wspólne dla obu widoków):
  - ▶ Play / ⏸ Pause - odtwarzanie/pauza animacji
  - ↻ Restart - reset do początku
  - Prędkość: 0.25x, 0.5x, 1x, 2x
- **Progress bar**: wizualny wskaźnik postępu z licznikiem (np. "15/60")
- **Sekwencja**: zachowanie kolejności instrukcji PTP/LIN z pliku .src

## Przykładowe wyniki

```
📖 Loading files...

🎯 Base Points (2D):
  Xdose_A_1: (17, 3)
  Xdose_A_2: (31, 3)
  Xdose_B_1: (17, -5)
  Xdose_B_2: (31, -7)

🎯 Base Points (3D):
  Xdose_A_1: (17, 3, 0.274462)
  Xdose_A_2: (31, 3, 2.95810342)
  Xdose_B_1: (17, -5, 0.168337673)
  Xdose_B_2: (31, -7, 2.99627256)

📍 Found 60 offsets:
  dose_A: 30 offsets
  dose_B: 30 offsets

🧮 Calculating 2D positions...
✅ Successfully calculated 60 2D positions

🧮 Calculating 3D positions...
✅ Successfully calculated 60 3D positions

📊 Sample final positions (2D):
  dose_A_offset_010: (15.00, 1.00) [base: Xdose_A_1]
  dose_A_offset_020: (13.00, 0.50) [base: Xdose_A_1]
  dose_A_offset_030: (25.50, 0.50) [base: Xdose_A_2]

📊 Sample final positions (3D):
  dose_A_offset_010: (15.00, 1.00, 45.27) [base: Xdose_A_1]
  dose_A_offset_020: (13.00, 0.50, 0.77) [base: Xdose_A_1]
  dose_A_offset_030: (25.50, 0.50, 1.96) [base: Xdose_A_2]

📈 Organizing chart data (2D and 3D)...

🎬 Building trajectory for animation...
✅ 2D Trajectory built: 60 sequential points
✅ 3D Trajectory built: 60 sequential points

✅ Chart saved to: dispensing-points.html
📊 2D View: XY plane visualization
📊 3D View: XYZ space visualization
🎬 Animation enabled with 60 trajectory points (synchronized)
```

## Technologie

- **Runtime**: Bun
- **Język**: TypeScript
- **Walidacja**: Zod
- **Wizualizacja**: Plotly.js
- **Testy**: Bun Test

## Status implementacji

- ✅ **Phase 0**: Setup projektu
- ✅ **Phase 1**: Parser .src (offsety X, Y, Z)
- ✅ **Phase 2**: Parser .dat (punkty bazowe 2D i 3D)
- ✅ **Phase 3**: Obliczanie pozycji 2D i 3D
- ✅ **Phase 4**: Wykres 2D
- ✅ **Phase 6**: Animacja sekwencyjna trajektorii 2D
- ✅ **Phase 7**: Wizualizacja 3D z przełącznikiem i synchronizowaną animacją
  - ✅ Phase 7.1: Parsery Z
  - ✅ Phase 7.2: Obliczenia 3D
  - ✅ Phase 7.3: Wykres 3D
  - ✅ Phase 7.4: Przełącznik widoków
  - ✅ Phase 7.5: Animacja 3D
  - ✅ Phase 7.6: Synchronizacja animacji
  - ✅ Phase 7.7: Integracja i testy
- 🔲 **Phase 5**: Watch mode (opcjonalnie)

## Licencja

MIT
