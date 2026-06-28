# Unified Nutrition & Energy Tracker

A completely client-side, zero-backend web application for daily nutrition tracking and energy expenditure management. Designed to be deployed as a single static file via GitHub Pages, this tool prioritizes speed, minimal friction, and data privacy by utilizing browser local storage.

---

## 1. Architecture & Design Principles

- **Zero-Backend Architecture:** Run entirely in the user's browser with no server-side databases or API integrations (except optional future lightweight libraries).
- **Single-File Structure:** All HTML, CSS, and JavaScript reside in a single `index.html` file to facilitate rapid AI-assisted development and ensure easy hosting.
- **Privacy First:** All personal metrics, goals, and logged food entries are stored exclusively in the browser's `localStorage`. No user data is collected or transmitted.
- **Offline Capability:** A service worker caches the static HTML shell, allowing the app to function fully offline.

---

## 2. Technical Stack & Constraints

- **Core Technologies:** HTML5, Vanilla CSS, and Modern ES6+ JavaScript.
- **Data Persistence:** `window.localStorage` (up to ~5MB storage limit).
- **Offline Support:** Lightweight Service Worker caching.
- **Performance Optimization:** Limit DOM elements by paginating or rendering only the active week's logging history.
- **Validation:** Dual-layer validation using HTML5 form attributes (e.g., `required`, `min="0"`) and JavaScript sanitization to avoid computational errors (`NaN` values).

---

## 3. Data Schema & Storage Layout

### LocalStorage Keys

1. `user_goals` (Object):
   ```json
   {
     "age": 30,
     "sex": "male",
     "height": 180,
     "weight": 80,
     "activityLevel": "moderate",
     "dailyCalorieGoal": 2000,
     "bmr": 1800,
     "tdee": 2500,
     "macroSplits": {
       "protein": 150,
       "carbs": 200,
       "fats": 67
     }
   }
   ```

2. `food_log` (Array of Objects):
   ```json
   [
     {
       "id": "1719600000000",
       "timestamp": "2026-06-28T18:00:00.000Z",
       "name": "Oatmeal",
       "calories": 350,
       "protein": 12,
       "carbs": 60,
       "fats": 6,
       "massGrams": 100
     }
   ]
   ```

---

## 4. Key Functional Features

### 4.1 TDEE Calculator & Goal Configuration
- Mifflin-St Jeor equation parity with `tdeecalculator.net`.
- Inputs: Age, Sex, Height, Weight, Activity Level.
- Outputs: Maintenance calories, Bulking target (+500 kcal), Cutting target (-500 kcal), and macro splits.
- Interactivity: "Save as Daily Goal" button persistently binds the chosen target configuration to the active dashboard.

### 4.2 Food Logging Interface & Conversions
- Single-page quick entry form.
- Inputs: Food Name, Energy Value per 100g, Consumed Mass.
- Toggles: Unit conversions for kcal/kJ and grams/ounces.
  - $1 \text{ kcal} = 4.184 \text{ kJ}$
  - $1 \text{ oz} = 28.3495 \text{ g}$
- Macros: Optional input fields for Protein, Carbs, and Fats per 100g.

### 4.3 History, Analytics, and Portability
- **History Log:** Searchable, editable, and filterable table of past entries.
- **Export Data:** Download all data as a `.csv` format (spreadsheet ready) or `.json` (backup).
- **Import Data:** Upload a `.json` backup file to restore application state.

---

## 5. User Stories & Acceptance Criteria

### US1: Calculate and Save Cutting Goal
- **As a user**, I want to use the TDEE calculator first to find my cutting phase calories and save that exact value so my dashboard tracks against my weight-loss goal.
- **Acceptance Criteria:** The calculator outputs specific cutting targets. Selecting the cutting target permanently updates the dashboard's daily allowance across sessions until the user changes it.

### US2: Log Food
- **As a user**, I want to log my food by entering its name, energy per 100g, and amount eaten.
- **Acceptance Criteria:** The form must allow toggling between kcal/kJ and g/oz. Submitting the form must update the dashboard running total immediately without a network request.

### US3: Offline Usage
- **As a user**, I want the app to load quickly and work without an internet connection.
- **Acceptance Criteria:** Refreshing the page with network disabled in DevTools must load the app and retain all logged data from previous sessions.

### US4: Export to CSV
- **As a user**, I want to download all my logged food data as a CSV file so I can analyze my habits in a spreadsheet.
- **Acceptance Criteria:** Clicking "Export CSV" automatically downloads a file containing the date, food name, calories, macros, and mass for every historical entry, formatted correctly for spreadsheet software.

---

## 6. Phased Development Roadmap

### Phase 1: Core Engine (MVP)
1. Scaffold the single-file layout (`index.html`).
2. Integrate Mifflin-St Jeor math calculations and setup wizard.
3. Construct the food logging form with unit conversion logic.
4. Establish dynamic dashboard updates and basic `localStorage` persistence.

### Phase 2: Analytics & Data Portability
1. Implement a 7-day trend visualizer (average intake vs. goal).
2. Create "frequent food" quick-add chips.
3. Build JSON import/export and CSV export functions.

### Phase 3: Future Optimizations
1. Client-side barcode scanning utilizing camera feed and free APIs (e.g., Open Food Facts via QuaggaJS).
2. Multi-item recipe builder to save custom combined foods.
