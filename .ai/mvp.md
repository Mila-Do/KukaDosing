# MVP: Wykres 2D punktów dozowania (dose_a, dose_b)

## Cel
Wizualizacja 2D układu punktów dozowania:
1. Punkty bazowe: Xdose_A_1, Xdose_A_2, Xdose_B_1, Xdose_B_2
2. Pozycje końcowe wszystkich offsetów (base + offset w płaszczyźnie XY)

---

## Krotki MVP

### 1. `BasePoint`
Reprezentuje punkt bazowy (nauczony na robocie).
```
(name: string, x: number, y: number)
```
- `name`: "Xdose_A_1" | "Xdose_A_2" | "Xdose_B_1" | "Xdose_B_2"
- `x`, `y`: współrzędne w układzie robota (mm)

**Źródło danych:** Punkty nauczone – współrzędne z pliku .dat (np. `KRC:\R1\Program\010_Trajectories`) lub konfiguracja użytkownika. W `.src` nie są zdefiniowane.

---

### 2. `Offset`
Przesunięcie względem punktu bazowego (format KUKA: `{X, Y, Z, A, B, C}`).
```
(name: string, x: number, y: number, basePoint: string)
```
- `name`: np. "dose_A_offset_010"
- `x`, `y`: komponenty X, Y offsetu (mm)
- `basePoint`: "Xdose_A_1" | "Xdose_A_2" | "Xdose_B_1" | "Xdose_B_2"

---

### 3. `OffsetPosition2D`
Pozycja końcowa w płaszczyźnie XY (punkt bazowy + offset).
```
(name: string, x: number, y: number, basePoint: string)
```
- `x`, `y`: base.x + offset.x, base.y + offset.y

### 4. `OffsetPosition3D`
Pozycja końcowa w przestrzeni XYZ (punkt bazowy + offset).
```
(name: string, x: number, y: number, z: number, basePoint: string)
```
- `x`, `y`, `z`: base.x + offset.x, base.y + offset.y, base.z + offset.z

---

## Dane wejściowe

### Punkty bazowe (z pliku `.dat`)
Wartości są automatycznie parsowane z pliku `PickAndDrop.dat`:

```krl
GLOBAL E6POS Xdose_A_1={X 17.0000,Y 3.00000,Z 0.274462,...}
GLOBAL E6POS Xdose_A_2={X 31.0000,Y 3.00000,Z 2.95810342,...}
GLOBAL E6POS Xdose_B_1={X 17.0000,Y -5.00000,Z 0.168337673,...}
GLOBAL E6POS Xdose_B_2={X 31.0000,Y -7.00000,Z 2.99627256,...}
```

Parser wyciąga wartości:
- **2D**: X i Y dla każdego punktu bazowego
- **3D**: X, Y i Z dla każdego punktu bazowego

### Offsets
**Wyłącznie dynamicznie z kodu** – bez hardcodowania. Parser musi za każdym razem przeszukać `.src` i odkryć aktualną listę.

---

## Wymagania MVP

1. **Aktywne wyszukiwanie offsetów** – parser skanuje `.src` i odkrywa:
   - **Definicję wartości:** `dose_(A|B)_offset_(\d+)\s*=\s*\{X\s+([-\d.]+)\s*,\s*Y\s+([-\d.]+)` → name, x, y
   - **Powiązanie z base:** `PTP\s+(dose_(A|B)_offset_\d+)\s*:\s*(Xdose_(A|B)_[12])` → offset name, basePoint
   - Tylko offsety faktycznie użyte w `PTP`/`LIN` w sekcjach dose_a i dose_b.
2. **Sekcje dose_a i dose_b** – parsować tylko bloki `;FOLD dose_A` … `;ENDFOLD` oraz `;FOLD dose_B` … `;ENDFOLD` (kod może się zmieniać – bez przywiązania do konkretnych numerów offsetów).
3. **Konfiguracja baz** – plik/UI do wprowadzenia x,y dla Xdose_A_1, Xdose_A_2, Xdose_B_1, Xdose_B_2.
4. **Obliczanie pozycji** – dla każdego znalezionego offsetu:
   - **2D**: `(base.x + offset.x, base.y + offset.y)`
   - **3D**: `(base.x + offset.x, base.y + offset.y, base.z + offset.z)`
5. **Wykres 2D** – scatter plot:
   - 4 punkty bazowe (np. kolor A vs B, kształt 1 vs 2),
   - punkty offsetów (np. kolor dose_A vs dose_B, etykiety opcjonalne).
6. **Wykres 3D** – scatter3d plot:
   - 4 punkty bazowe w przestrzeni XYZ (kolor A vs B, kształt 1 vs 2),
   - punkty offsetów w przestrzeni 3D (kolor dose_A vs dose_B, etykiety opcjonalne),
   - interaktywna rotacja i zoom.
7. **Przełącznik widoków** – możliwość przełączania między wykresem 2D i 3D:
   - Toggle/przyciski UI,
   - zachowanie stanu animacji przy przełączeniu.
8. **Animacja sekwencyjna** – wizualizacja kolejności wykonywania punktów (2D i 3D):
   - Punkty pojawiają się po kolei zgodnie z kolejnością w programie robota,
   - Linie łączące kolejne punkty pojawiają się z interwałem 0.5s,
   - Wizualizacja trajektorii ruchu robota (dose_A → dose_B),
   - Kontrolki animacji: play/pause/restart/speed control,
   - synchronizacja animacji między widokami 2D i 3D.

---

## Propozycja implementacji

- **Stack:** JS (HTML + Plotly.js) dla interaktywności i animacji w przeglądarce.
- **Input:** `PickAndDrop.src` (parsowany przy każdym uruchomieniu) + `PickAndDrop.dat` z współrzędnymi punktów bazowych.
- **Output:** Interaktywny wykres HTML z animacją trajektorii i przełącznikiem 2D/3D.
- **Wizualizacja:**
  - **2D**: Plotly scatter (widok XY z góry)
  - **3D**: Plotly scatter3d (pełna przestrzeń XYZ z rotacją)
  - Przełącznik UI między widokami
- **Animacja:** 
  - Plotly.js Frames API lub custom timer z incremental rendering
  - Synchronizacja animacji między widokami 2D i 3D
  - Zachowanie stanu animacji przy przełączeniu widoku
- **Ważne:** Brak statycznej listy offsetów – każda zmiana w `.src` ma być automatycznie odzwierciedlona na wykresie.
