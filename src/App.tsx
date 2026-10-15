/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { MissionRecord, FilterState, SortConfig, ColumnKey } from './types';
import { parseFileBuffer } from './utils/parser';
import { DEFAULT_VISIBLE_COLUMNS } from './utils/columns';
import { exportData } from './utils/export';
import { parseGuids, getColumnFilterValue } from './utils/filterUtils';

import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { TableToolbar } from './components/TableToolbar';
import { DataTable } from './components/DataTable';
import { EmptyState } from './components/EmptyState';

export default function App() {
  const [records, setRecords] = useState<MissionRecord[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    guidQuery: '',
    columnFilters: {},
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'winningDate',
    direction: 'asc',
  });

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(
    DEFAULT_VISIBLE_COLUMNS
  );

  // Parse uploaded file (XLSX, XLS, or CSV)
  const handleFileUpload = useCallback((file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) {
          throw new Error('File reading failed: buffer is empty');
        }
        const parsed = parseFileBuffer(buffer);
        if (parsed.length === 0) {
          throw new Error('No valid records found in the uploaded file.');
        }

        // Uploading a new file replaces current dataset
        setRecords(parsed);
        setFileName(file.name);
        setFilters({
          searchQuery: '',
          guidQuery: '',
          columnFilters: {},
        });
      } catch (err: unknown) {
        console.error('Error parsing spreadsheet:', err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Failed to parse file. Please verify it is a valid .xlsx, .xls, or .csv file.'
        );
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file.');
    };

    reader.readAsArrayBuffer(file);
  }, []);

  // Filter change handlers
  const handleSearchChange = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const handleGuidChange = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, guidQuery: query }));
  }, []);

  const handleColumnFilterChange = useCallback(
    (column: ColumnKey, selected: string[] | undefined) => {
      setFilters((prev) => {
        const nextFilters = { ...prev.columnFilters };
        if (!selected) {
          delete nextFilters[column];
        } else {
          nextFilters[column] = selected;
        }
        return { ...prev, columnFilters: nextFilters };
      });
    },
    []
  );

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      guidQuery: '',
      columnFilters: {},
    });
  }, []);

  const isFiltered = Boolean(
    filters.searchQuery ||
    filters.guidQuery ||
    Object.keys(filters.columnFilters).length > 0
  );

  // Filter records based on active GUIDs, search, and column filter selections
  const filteredRecords = useMemo(() => {
    const guidTokens = parseGuids(filters.guidQuery);
    const hasGuids = guidTokens.length > 0;
    const searchLower = filters.searchQuery.toLowerCase().trim();
    const activeColumnFilters = Object.entries(filters.columnFilters).filter(
      ([, values]) => values && values.length > 0
    );

    return records.filter((rec) => {
      // 1. GUID multi-token filter (matches any of the entered GUIDs)
      if (hasGuids) {
        const playerLower = rec.player.toLowerCase();
        const matchesAnyGuid = guidTokens.some((token) =>
          playerLower.includes(token)
        );
        if (!matchesAnyGuid) return false;
      }

      // 2. Column-level filters
      for (const [colKey, allowedValues] of activeColumnFilters) {
        const cellValue = getColumnFilterValue(rec, colKey as ColumnKey);
        if (!allowedValues!.includes(cellValue)) {
          return false;
        }
      }

      // 3. Search query across visible/relevant text fields
      if (searchLower) {
        const matches =
          rec.player.toLowerCase().includes(searchLower) ||
          rec.roundId.toLowerCase().includes(searchLower) ||
          String(rec.missionNumber).toLowerCase().includes(searchLower) ||
          rec.operator.toLowerCase().includes(searchLower) ||
          rec.brand.toLowerCase().includes(searchLower) ||
          rec.winningDate.toLowerCase().includes(searchLower) ||
          rec.prizePlayerCurrencyRaw.toLowerCase().includes(searchLower) ||
          rec.currency.toLowerCase().includes(searchLower) ||
          rec.prizeReceived.toLowerCase().includes(searchLower) ||
          rec.prizeEurRaw.toLowerCase().includes(searchLower) ||
          rec.prizeStatus.toLowerCase().includes(searchLower) ||
          rec.payoutStatus.toLowerCase().includes(searchLower) ||
          rec.transactionDate.toLowerCase().includes(searchLower);

        if (!matches) return false;
      }

      return true;
    });
  }, [records, filters]);

  // Sort filtered records
  const sortedRecords = useMemo(() => {
    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    return [...filteredRecords].sort((a, b) => {
      switch (key) {
        case 'guid':
          return a.player.localeCompare(b.player) * modifier;
        case 'roundId': {
          if (a.roundIdNumber !== null && b.roundIdNumber !== null) {
            return (a.roundIdNumber - b.roundIdNumber) * modifier;
          }
          return a.roundId.localeCompare(b.roundId) * modifier;
        }
        case 'missionNumber': {
          return (a.missionNumberVal - b.missionNumberVal) * modifier;
        }
        case 'winningDate': {
          const timeA = a.winningDateTimestamp || 0;
          const timeB = b.winningDateTimestamp || 0;
          return (timeA - timeB) * modifier;
        }
        case 'transactionDate': {
          const timeA = a.transactionDateTimestamp || 0;
          const timeB = b.transactionDateTimestamp || 0;
          return (timeA - timeB) * modifier;
        }
        case 'prizePlayerCurrency': {
          const valA = a.prizePlayerCurrency;
          const valB = b.prizePlayerCurrency;
          if (valA === null && valB === null) return 0;
          if (valA === null) return 1;
          if (valB === null) return -1;
          return (valA - valB) * modifier;
        }
        case 'prizeEur': {
          const valA = a.prizeEur;
          const valB = b.prizeEur;
          if (valA === null && valB === null) return 0;
          if (valA === null) return 1;
          if (valB === null) return -1;
          return (valA - valB) * modifier;
        }
        case 'operator':
          return a.operator.localeCompare(b.operator) * modifier;
        case 'brand':
          return a.brand.localeCompare(b.brand) * modifier;
        case 'currency':
          return a.currency.localeCompare(b.currency) * modifier;
        case 'prizeReceived':
          return a.prizeReceived.localeCompare(b.prizeReceived) * modifier;
        case 'prizeStatus':
          return a.prizeStatus.localeCompare(b.prizeStatus) * modifier;
        case 'payoutStatus':
          return a.payoutStatus.localeCompare(b.payoutStatus) * modifier;
        default:
          return 0;
      }
    });
  }, [filteredRecords, sortConfig]);

  // Compute live KPIs from filtered records
  const kpis = useMemo(() => {
    const totalRecords = filteredRecords.length;

    const uniquePlayers = new Set<string>();
    const uniqueMissions = new Set<string | number>();
    let totalPrizeEur = 0;

    filteredRecords.forEach((r) => {
      if (r.player) uniquePlayers.add(r.player);
      if (r.missionNumber && r.missionNumber !== '—') {
        uniqueMissions.add(r.missionNumber);
      }
      if (r.prizeEur !== null) {
        totalPrizeEur += r.prizeEur;
      }
    });

    return {
      totalRecords,
      distinctPlayers: uniquePlayers.size,
      distinctMissions: uniqueMissions.size,
      totalPrizeEur,
    };
  }, [filteredRecords]);

  // Column visibility toggling
  const handleColumnToggle = useCallback((key: ColumnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleShowAllColumns = useCallback(() => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  }, []);

  const handleResetColumns = useCallback(() => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  }, []);

  // Sort header click
  const handleSortChange = useCallback((column: ColumnKey) => {
    setSortConfig((prev) => {
      if (prev.key === column) {
        return {
          key: column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        key: column,
        direction: 'asc',
      };
    });
  }, []);

  // Export action
  const handleExport = useCallback(
    (format: 'csv' | 'xlsx', includeHidden: boolean) => {
      const baseName = fileName ? fileName.replace(/\.[^.]+$/, '') : 'mission_winners';
      exportData({
        records: sortedRecords,
        visibleColumns,
        includeHiddenColumns: includeHidden,
        format,
        fileName: `${baseName}_export`,
      });
    },
    [sortedRecords, visibleColumns, fileName]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-[#084968]/20">
      {/* Top Header */}
      <Header
        fileName={fileName}
        onFileUpload={handleFileUpload}
        hasData={records.length > 0}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
        {records.length === 0 ? (
          <EmptyState
            onFileUpload={handleFileUpload}
            errorMessage={errorMessage}
          />
        ) : (
          <>
            {/* KPI Cards Row */}
            <KpiCards
              totalRecords={kpis.totalRecords}
              distinctPlayers={kpis.distinctPlayers}
              distinctMissions={kpis.distinctMissions}
              totalPrizeEur={kpis.totalPrizeEur}
            />

            {/* Table Toolbar with Search, GUIDs insert, Columns, and Export */}
            <TableToolbar
              totalRecords={records.length}
              filteredCount={filteredRecords.length}
              searchQuery={filters.searchQuery}
              onSearchChange={handleSearchChange}
              guidQuery={filters.guidQuery}
              onGuidChange={handleGuidChange}
              isFiltered={isFiltered}
              onClearAllFilters={handleClearAllFilters}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
              onShowAllColumns={handleShowAllColumns}
              onResetColumns={handleResetColumns}
              onExport={handleExport}
            />

            {/* Data Table with column sort & Excel-like column filter dropdowns */}
            <DataTable
              records={sortedRecords}
              allRecords={records}
              visibleColumns={visibleColumns}
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
              columnFilters={filters.columnFilters}
              onColumnFilterChange={handleColumnFilterChange}
              onClearFilters={handleClearAllFilters}
              isFiltered={isFiltered}
            />
          </>
        )}
      </main>
    </div>
  );
}
