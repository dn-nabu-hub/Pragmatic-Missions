/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Fingerprint, FilterX, Columns3, Download, ChevronDown } from 'lucide-react';
import { ColumnKey } from '../types';
import { TABLE_COLUMNS } from '../utils/columns';

interface TableToolbarProps {
  totalRecords: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  guidQuery: string;
  onGuidChange: (val: string) => void;
  isFiltered: boolean;
  onClearAllFilters: () => void;
  visibleColumns: Record<ColumnKey, boolean>;
  onColumnToggle: (key: ColumnKey) => void;
  onShowAllColumns: () => void;
  onResetColumns: () => void;
  onExport: (format: 'csv' | 'xlsx', includeHidden: boolean) => void;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  totalRecords,
  filteredCount,
  searchQuery,
  onSearchChange,
  guidQuery,
  onGuidChange,
  isFiltered,
  onClearAllFilters,
  visibleColumns,
  onColumnToggle,
  onShowAllColumns,
  onResetColumns,
  onExport,
}) => {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [includeHiddenInExport, setIncludeHiddenInExport] = useState(false);

  const columnsRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        columnsRef.current &&
        !columnsRef.current.contains(event.target as Node)
      ) {
        setColumnsOpen(false);
      }
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
      {/* Left: Search, GUID insert, and Clear Filters */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search in table */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search in table..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50/80 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#084968] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* GUID insert */}
        <div className="relative min-w-[240px] flex-1 sm:max-w-sm">
          <Fingerprint className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Insert GUIDs (separated by spaces or commas)..."
            value={guidQuery}
            onChange={(e) => onGuidChange(e.target.value)}
            className={`w-full h-8 pl-8 pr-7 text-xs rounded-md border transition-colors ${
              guidQuery
                ? 'bg-sky-50/30 border-[#084968] text-[#084968] focus:bg-white'
                : 'bg-slate-50/80 border-slate-200 focus:bg-white focus:border-[#084968]'
            } focus:outline-none`}
          />
          {guidQuery && (
            <button
              type="button"
              onClick={() => onGuidChange('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clear All Filters */}
        <button
          type="button"
          onClick={onClearAllFilters}
          disabled={!isFiltered}
          className={`inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            isFiltered
              ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
              : 'text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed'
          }`}
          title="Reset search, GUIDs, and column filters"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* Right: Record count, Columns dropdown & Export Menu */}
      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
          Showing <span className="font-semibold text-slate-900 font-mono tabular-nums">{filteredCount}</span> of{' '}
          <span className="font-semibold text-slate-900 font-mono tabular-nums">{totalRecords}</span>
          {filteredCount !== totalRecords && (
            <span className="ml-1 text-[#084968] font-semibold">(Filtered)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Columns Dropdown */}
          <div className="relative" ref={columnsRef}>
            <button
              type="button"
              onClick={() => setColumnsOpen(!columnsOpen)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Columns3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns ({visibleCount}/{TABLE_COLUMNS.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {columnsOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg border border-slate-200 shadow-lg z-50 p-2 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-900">Toggle Columns</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={onShowAllColumns}
                      className="text-[#084968] hover:underline font-medium cursor-pointer"
                    >
                      Show All
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={onResetColumns}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {TABLE_COLUMNS.map((col) => {
                    const isChecked = !!visibleColumns[col.key];
                    return (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-slate-700 select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onColumnToggle(col.key)}
                          className="rounded border-slate-300 text-[#084968] focus:ring-[#084968] cursor-pointer"
                        />
                        <span className="truncate">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg border border-slate-200 shadow-lg z-50 p-2 text-xs">
                <div className="px-2 py-1 mb-1 font-semibold text-slate-900 border-b border-slate-100">
                  Export Filtered Data
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onExport('csv', includeHiddenInExport);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Export as CSV (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExport('xlsx', includeHiddenInExport);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span>Export as Excel (.xlsx)</span>
                  </button>
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      checked={includeHiddenInExport}
                      onChange={(e) => setIncludeHiddenInExport(e.target.checked)}
                      className="rounded border-slate-300 text-[#084968] focus:ring-[#084968] cursor-pointer"
                    />
                    <span className="text-[11px]">Include hidden columns</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
