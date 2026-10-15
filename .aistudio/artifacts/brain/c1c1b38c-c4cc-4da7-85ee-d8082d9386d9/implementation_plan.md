# Mission Winners Dashboard

A lightweight, modern, data-dense business dashboard designed to upload, inspect, filter, and export player mission and prize data from Excel (`.xlsx`, `.xls`) and CSV files.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following preferences have been confirmed and integrated into this architecture:

- **Confirmed Decision 1 (Initial View)**: Starts with an empty upload state featuring a clean drag-and-drop zone, file selector, and an instant "Load Sample Dataset" trigger for immediate testing with the provided data.
- **Confirmed Decision 2 (Export Formats)**: Both Excel (`.xlsx`) and CSV exports will be supported directly in the browser, with an explicit option to export all columns (including hidden ones).
- **Confirmed Decision 3 (Aesthetic Theme)**: Crisp white/light-grey background (`#FFFFFF` / `#F8FAFC`), subtle hairline dividers, and `#084968` (deep oceanic blue) as the focused accent color for active controls, table sort indicators, and primary action buttons.

---

### 1. Overview & Core Concept

- **What It Does**: Parses tabular reports containing mission outcomes, prize awards, and transaction timestamps across gaming operators and brands. It automatically cleans messy multi-block export files (e.g. repeated header lines and empty spacer rows), computes live summary KPIs, provides instantaneous multi-criteria filtering, and renders a high-performance 12-column data grid.
- **Target Audience**: Campaign managers, CRM operations, and BI analysts reviewing promotional mission payouts and prize fulfillment.
- **Key Value**: Zero-latency local data processing with zero server uploads, preserving raw currency data, supporting dynamic schema parsing, and generating clean filtered exports in one click.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Empty State / Launch**:
   - Clean, focused dropzone accepting `.xlsx`, `.xls`, and `.csv` files.
   - Secondary button to load the embedded 22-record sample mission dataset instantly.
2. **Dashboard Overview**:
   - **Compact Header**: Wordmark **Mission Winners**, loaded file indicator, "Load Sample" shortcut, and "Upload File" button (`#084968`).
   - **KPI Strip**: 4 compact cards in one continuous row:
     - **Total Records** (count of matching entries)
     - **Players** (distinct unique player UUIDs)
     - **Missions** (distinct mission stages, e.g. 1 to 5)
     - **Total Prizes (EUR)** (sum of EUR prize values with tabular formatting)
   - **Compact Filter Bar**:
     - *View Toggle*: Segmented control for `All Players` vs `Single Player`.
     - *Player Dropdown*: Searchable/selectable player list showing player UUID and count.
     - *Mission Dropdown*: Quick filter by mission number (All, 1, 2, 3, 4, 5...).
     - *Search Input*: Real-time text match across player, operator, brand, prize descriptions, and status.
     - *Clear Filters*: Resets all filter values instantly.
   - **Table Controls & Data Grid**:
     - *Column Visibility Popover*: Checkbox list for all 12 columns, with "Show All" and "Reset" controls.
     - *Export Menu*: Dropdown with "Export as CSV" and "Export as Excel (.xlsx)", plus an "Include hidden columns" toggle.
     - *Data Table*: Single consolidated header row, sticky positioning, alternating zebra rows (`#FFFFFF` and `#F8FAFC`), subtle hover states, click-to-sort with asc/desc indicators, and em dash (`—`) rendering for missing or null cells.

#### B. Visual Identity & Theme
- **Color Palette**:
  - Main Background: `#FFFFFF` and `#F8FAFC`
  - Accent Color: `#084968` (Deep Petrol Blue)
  - Accent Hover: `#063952`
  - Subtle Borders: `#E2E8F0` / `#CBD5E1`
  - Typography: `#0F172A` (headings/data), `#64748B` (secondary labels)
  - Status Indicators: Subtle semantic badges (e.g. Awarded: soft emerald, Expired: soft slate, Completed: soft blue, Manual: soft amber)
- **Typography**:
  - Display/Headings: `Plus Jakarta Sans` or clean modern sans
  - Data Values & Figures: Tabular numbers (`tabular-nums`) with monospace alignment for numeric IDs and amounts
- **Zero-Pill Discipline**: Metadata displayed as clean, unboxed text or soft functional badges; no garish pill sandwiches or decorative pulsing dots.

---

### 3. Key Product Decisions & Trade-Offs

- **Client-Side Processing with SheetJS (`xlsx`)**:
  - *Chosen Approach*: Handle Excel (`.xlsx`, `.xls`) and CSV parsing completely client-side in the browser using the lightweight `xlsx` engine.
  - *Why*: Instant speed, zero network latency, complete data privacy, and full offline capability without uploading sensitive player UUIDs to any external server.
- **Multi-Header / Multi-Block Normalization**:
  - *Chosen Approach*: The parser inspects every row, detects duplicate header rows (common in automated exports where headers repeat per player block), filters out empty spacer lines, and standardizes scientific notation round IDs (e.g., `9.51755E+13` to precise integer representation).
  - *Why*: Eliminates corrupt or broken table rows and guarantees one seamless unified dataset.
- **Column Customization & Persistence**:
  - *Chosen Approach*: Column visibility is maintained in responsive state so toggling columns never interrupts active filters, active sorts, or pagination.
- **Unified 12-Column Contract**:
  - Columns strictly match the requested sequence:
    1. Round ID
    2. Mission number
    3. Operator
    4. Brand
    5. Winning Date
    6. Prize in player's currency
    7. Currency
    8. Prize Received
    9. Prize in main currency,EUR
    10. Prize status
    11. Payout status
    12. Transaction Date

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Mission Winners Dashboard                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Bar: [ Mission Winners ]         [Load Sample]  [Upload File (.xlsx/csv)] │
├─────────────────────────────────────────────────────────────────────────────┤
│  KPI Strip: [Total Records]  │  [Players]  │  [Missions]  │  [Total EUR]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Filters:   [All / Single]   │  [Player ▼] │  [Mission ▼] │ [Search...] [✕]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Actions:   [ Columns (12) ▼ ]                      [ Export (CSV/XLSX) ▼ ]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Data Table (Sticky Header, Sortable, Tabular figures, Zebra Rows)          │
│  ┌──────────┬─────────┬──────────┬───────┬──────────────┬───────────────┐   │
│  │ Round ID │ Mission │ Operator │ Brand │ Winning Date │ Prize in Cur. │...│
│  ├──────────┼─────────┼──────────┼───────┼──────────────┼───────────────┤   │
│  │ 951755.. │    1    │ Throne.. │ Into..│ 10/6/26 10:30│ 250 TRY       │   │
│  │ 951771.. │    2    │ Throne.. │ Into..│ 10/6/26 11:11│ —             │   │
│  └──────────┴─────────┴──────────┴───────┴──────────────┴───────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### State & Data Lifecycle
- **`rawRecords: MissionRecord[]`**: Extracted records with typed numbers, dates, strings, and original player identifiers.
- **`filters: FilterState`**:
  - `viewMode`: `'all' | 'single'`
  - `selectedPlayer`: string (or all)
  - `selectedMission`: string (or all)
  - `searchQuery`: string
- **`sortConfig: { column: ColumnKey; direction: 'asc' | 'desc' }`**: Handles natural alphanumeric sorting, high-precision numeric comparison, and date comparisons.
- **`visibleColumns: Record<ColumnKey, boolean>`**: Map of column keys to visibility booleans with quick "Show All" and "Reset" helpers.
- **`exportData(format: 'csv' | 'xlsx', allColumns: boolean)`**: Serializes active filtered records into a downloadable file with proper formatting.

---

### 5. Verification Plan

1. **Build & Lint Verification**:
   - Install `xlsx` package for robust spreadsheet ingestion and export.
   - Run `npm run lint` and `compile_applet` to confirm clean compilation with zero warnings or errors.
2. **Functional Verification**:
   - Test empty state initial presentation.
   - Test "Load Sample" loading the 22 prompt records flawlessly.
   - Test file upload with CSV and Excel formats.
   - Verify all 12 columns appear in specified sequence.
   - Verify sorting on numeric, text, and date columns.
   - Verify column visibility toggle (hide/show, Reset, Show All).
   - Verify KPI cards update dynamically upon filtering.
   - Verify CSV and Excel exports match active filters and column preferences.
