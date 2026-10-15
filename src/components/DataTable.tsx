/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Filter } from 'lucide-react';
import { MissionRecord, ColumnKey, SortConfig, ColumnFilters } from '../types';
import { TABLE_COLUMNS } from '../utils/columns';
import { getUniqueColumnValues } from '../utils/filterUtils';
import { ColumnFilterPopover } from './ColumnFilterPopover';

interface DataTableProps {
  records: MissionRecord[];
  allRecords: MissionRecord[];
  visibleColumns: Record<ColumnKey, boolean>;
  sortConfig: SortConfig;
  onSortChange: (column: ColumnKey) => void;
  columnFilters: ColumnFilters;
  onColumnFilterChange: (column: ColumnKey, selected: string[] | undefined) => void;
  onClearFilters?: () => void;
  isFiltered?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  allRecords,
  visibleColumns,
  sortConfig,
  onSortChange,
  columnFilters,
  onColumnFilterChange,
  onClearFilters,
  isFiltered,
}) => {
  const [activeFilterCol, setActiveFilterCol] = useState<ColumnKey | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const activeColumns = TABLE_COLUMNS.filter((col) => visibleColumns[col.key]);

  const handleOpenFilter = (key: ColumnKey, element: HTMLElement) => {
    setActiveFilterCol(key);
    setAnchorRect(element.getBoundingClientRect());
  };

  const handleCloseFilter = () => {
    setActiveFilterCol(null);
    setAnchorRect(null);
  };

  const renderCellContent = (record: MissionRecord, key: ColumnKey) => {
    switch (key) {
      case 'guid':
        return record.player ? (
          <span className="font-mono text-[11px] text-slate-800 select-all max-w-[260px] block truncate" title={record.player}>
            {record.player}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'roundId':
        return record.roundId ? (
          <span className="font-mono text-slate-800 select-all" title={record.roundId}>
            {record.roundId}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'missionNumber':
        return record.missionNumber && record.missionNumber !== '—' ? (
          <span className="font-mono font-medium text-slate-700">
            {record.missionNumber}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'operator':
        return record.operator ? (
          <span className="text-slate-800 font-medium">{record.operator}</span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'brand':
        return record.brand ? (
          <span className="text-slate-700">{record.brand}</span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'winningDate':
        return record.winningDate ? (
          <span className="text-slate-600 font-mono text-[11px] whitespace-nowrap">
            {record.winningDate}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'prizePlayerCurrency':
        if (
          record.prizePlayerCurrencyRaw === '' ||
          record.prizePlayerCurrencyRaw === '-' ||
          record.prizePlayerCurrencyRaw === '—'
        ) {
          return <span className="text-slate-300">—</span>;
        }
        return (
          <span className="font-mono tabular-nums text-slate-900 font-medium">
            {record.prizePlayerCurrency !== null
              ? record.prizePlayerCurrency.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })
              : record.prizePlayerCurrencyRaw}
          </span>
        );

      case 'currency':
        return record.currency ? (
          <span className="font-mono text-xs font-semibold text-slate-600 px-1 py-0.5 bg-slate-100 rounded">
            {record.currency}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'prizeReceived':
        return record.prizeReceived ? (
          <span className="text-slate-800 max-w-[280px] block truncate" title={record.prizeReceived}>
            {record.prizeReceived}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      case 'prizeEur':
        if (
          record.prizeEurRaw === '' ||
          record.prizeEurRaw === '-' ||
          record.prizeEurRaw === '—'
        ) {
          return <span className="text-slate-300">—</span>;
        }
        return (
          <span className="font-mono tabular-nums text-slate-900 font-semibold">
            {record.prizeEur !== null
              ? `€${record.prizeEur.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : record.prizeEurRaw}
          </span>
        );

      case 'prizeStatus':
        if (!record.prizeStatus || record.prizeStatus === '-' || record.prizeStatus === '—') {
          return <span className="text-slate-300">—</span>;
        }
        if (record.prizeStatus.toLowerCase() === 'awarded') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded">
              Awarded
            </span>
          );
        }
        if (record.prizeStatus.toLowerCase() === 'expired') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded">
              Expired
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded">
            {record.prizeStatus}
          </span>
        );

      case 'payoutStatus':
        if (!record.payoutStatus || record.payoutStatus === '-' || record.payoutStatus === '—') {
          return <span className="text-slate-300">—</span>;
        }
        if (record.payoutStatus.toLowerCase() === 'completed') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-[#084968] bg-[#084968]/10 border border-[#084968]/20 rounded">
              Completed
            </span>
          );
        }
        if (record.payoutStatus.toLowerCase() === 'manual') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/70 rounded">
              Manual
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded">
            {record.payoutStatus}
          </span>
        );

      case 'transactionDate':
        return record.transactionDate ? (
          <span className="text-slate-600 font-mono text-[11px] whitespace-nowrap">
            {record.transactionDate}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        );

      default:
        return <span className="text-slate-300">—</span>;
    }
  };

  const activeColumnDef = activeFilterCol
    ? TABLE_COLUMNS.find((c) => c.key === activeFilterCol)
    : null;

  const filterOptions = activeFilterCol
    ? getUniqueColumnValues(allRecords, activeFilterCol)
    : [];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] min-h-[380px]">
        <table className="w-full border-collapse text-left text-xs">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              {activeColumns.map((col) => {
                const isSorted = sortConfig.key === col.key;
                const hasFilter =
                  columnFilters[col.key] !== undefined &&
                  columnFilters[col.key]!.length > 0;

                return (
                  <th
                    key={col.key}
                    style={{ minWidth: col.minWidth }}
                    className={`py-2 px-3 font-semibold text-[11px] uppercase tracking-wider select-none text-left ${
                      isSorted ? 'bg-slate-100/70' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      {/* 1. Column Name + 2. Sort Icon */}
                      <button
                        type="button"
                        onClick={() => onSortChange(col.key)}
                        className={`inline-flex items-center gap-1.5 min-w-0 hover:text-slate-900 transition-colors cursor-pointer text-left ${
                          isSorted ? 'text-[#084968] font-bold' : 'text-slate-600'
                        }`}
                        title={`Sort by ${col.label}`}
                      >
                        <span className="truncate">{col.label}</span>
                        <span className="shrink-0 text-slate-400">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#084968]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#084968]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-30 hover:opacity-100" />
                          )}
                        </span>
                      </button>

                      {/* 3. Filter Icon */}
                      <button
                        type="button"
                        title={`Filter by ${col.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFilter(col.key, e.currentTarget);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                          hasFilter
                            ? 'text-white bg-[#084968] shadow-2xs ring-1 ring-[#084968]'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Alternating Rows (Zebra) */}
          <tbody className="divide-y divide-slate-100">
            {records.length > 0 ? (
              records.map((record, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={record.id}
                    className={`transition-colors hover:bg-sky-50/40 ${
                      isEven ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    {activeColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-2.5 px-3 text-slate-700 whitespace-nowrap ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {renderCellContent(record, col.key)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={activeColumns.length || 1}
                  className="py-16 text-center text-slate-400"
                >
                  <p className="text-sm font-medium text-slate-600">
                    No matching records found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your filters, GUIDs, or column options.
                  </p>
                  {isFiltered && onClearFilters && (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#084968] bg-[#084968]/10 hover:bg-[#084968]/20 rounded-md transition-colors cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Column Filter Dropdown Popover */}
      {activeFilterCol && activeColumnDef && (
        <ColumnFilterPopover
          columnLabel={activeColumnDef.label}
          options={filterOptions}
          selectedValues={columnFilters[activeFilterCol]}
          onApply={(selected) => onColumnFilterChange(activeFilterCol, selected)}
          onClose={handleCloseFilter}
          anchorRect={anchorRect}
        />
      )}
    </div>
  );
};
