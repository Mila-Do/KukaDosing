# KUKA Dispensing Points Visualizer

Narzędzie do parsowania i wizualizacji punktów dozowania z plików KUKA (.src, .dat) w formie wykresu 2D.

## Funkcjonalności

- ✅ **Parser .src**: Dynamiczne wyodrębnianie offsetów `dose_A_offset_*` i `dose_B_offset_*`
- ✅ **Parser .dat**: Automatyczne wyciąganie punktów bazowych (Xdose_A_1, Xdose_A_2, Xdose_B_1, Xdose_B_2)
- ✅ **Obliczenia 2D**: Dla każdego offsetu: `pozycja = punkt_bazowy + offset`
- ✅ **Wizualizacja**: Interaktywny wykres 2D z Plotly.js
- ✅ **Animacja trajektorii**: Wizualizacja kolejności wykonywania punktów z kontrolkami Play/Pause/Restart/Speed
- ✅ **Testy**: 24 testy jednostkowe (100% pokrycia, w tym zabezpieczenie kolejności animacji)

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
│   ├── parser.ts                       # Parser offsetów z .src + kolejność
│   ├── parser.test.ts                  # Testy parsera .src
│   ├── datParser.ts                    # Parser punktów bazowych z .dat
│   ├── calculatePositions.ts           # Obliczanie pozycji 2D
│   ├── calculatePositions.test.ts      # Testy obliczeń
│   ├── animation.ts                    # Logika animacji trajektorii
│   ├── animation.test.ts               # Testy animacji i kolejności
│   ├── plotChart.ts                    # Generowanie wykresu HTML + animacja
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

Parser wyciąga pozycje 2D punktów bazowych:

```
GLOBAL E6POS Xdose_A_1={X 17.0000,Y 3.00000,...}
```

### Faza 3: Obliczenia 2D

Dla każdego offsetu:

```typescript
position.x = basePoint.x + offset.x
position.y = basePoint.y + offset.y
```

### Faza 4: Wizualizacja

Generowany jest interaktywny wykres HTML z:

- **Punkty bazowe**: większe markery (○ = pozycja 1, □ = pozycja 2)
- **Punkty offsetów**: mniejsze markery
- **Kolory**: niebieski = dose_A, zielony = dose_B
- **Hover**: szczegóły każdego punktu
- **Export**: możliwość zapisania jako PNG (2x scaling)

### Faza 6: Animacja trajektorii

Wizualizacja kolejności wykonywania punktów:

- **Trajektoria**: pomarańczowa linia łącząca punkty w kolejności wykonania
- **Aktualny punkt**: czerwona gwiazda oznaczająca punkt w trakcie realizacji
- **Kontrolki**:
  - ▶ Play / ⏸ Pause - odtwarzanie/pauza animacji
  - ↻ Restart - reset do początku
  - Prędkość: 0.25x, 0.5x, 1x, 2x
- **Progress bar**: wizualny wskaźnik postępu z licznikiem (np. "15/60")
- **Sekwencja**: zachowanie kolejności instrukcji PTP/LIN z pliku .src

## Przykładowe wyniki

```
📖 Loading files...
🎯 Base Points: 4 punkty bazowe
📍 Found 60 offsets:
  dose_A: 30 offsets
  dose_B: 30 offsets

🧮 Calculating 2D positions...
✅ Successfully calculated 60 positions

📊 Sample final positions:
  dose_A_offset_010: (15.00, 1.00) [base: Xdose_A_1]
  dose_A_offset_020: (13.00, 0.50) [base: Xdose_A_1]
  dose_A_offset_030: (25.50, 0.50) [base: Xdose_A_2]

📈 Generating 2D chart...
🎬 Building trajectory for animation...
✅ Trajectory built: 60 sequential points
✅ Chart saved to: dispensing-points.html
🎬 Animation enabled with 60 trajectory points
```

## Technologie

- **Runtime**: Bun
- **Język**: TypeScript
- **Walidacja**: Zod
- **Wizualizacja**: Plotly.js
- **Testy**: Bun Test

## Status implementacji

- ✅ **Phase 0**: Setup projektu
- ✅ **Phase 1**: Parser .src (offsety)
- ✅ **Phase 2**: Parser .dat (punkty bazowe)
- ✅ **Phase 3**: Obliczanie pozycji 2D
- ✅ **Phase 4**: Wykres 2D
- ✅ **Phase 6**: Animacja sekwencyjna trajektorii
- 🔲 **Phase 5**: Watch mode (opcjonalnie)

## Licencja

MIT
