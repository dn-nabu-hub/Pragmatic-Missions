/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { MissionRecord, ColumnKey } from '../types';
import { TABLE_COLUMNS } from './columns';

function getRecordValue(rec: MissionRecord, key: ColumnKey): string | number {
  switch (key) {
    case 'guid':
      return rec.player || '—';
    case 'roundId':
      return rec.roundId || '—';
    case 'missionNumber':
      return rec.missionNumber || '—';
    case 'operator':
      return rec.operator || '—';
    case 'brand':
      return rec.brand || '—';
    case 'winningDate':
      return rec.winningDate || '—';
    case 'prizePlayerCurrency':
      return rec.prizePlayerCurrencyRaw !== '' ? rec.prizePlayerCurrencyRaw : '—';
    case 'currency':
      return rec.currency || '—';
    case 'prizeReceived':
      return rec.prizeReceived || '—';
    case 'prizeEur':
      return rec.prizeEurRaw !== '' ? rec.prizeEurRaw : '—';
    case 'prizeStatus':
      return rec.prizeStatus || '—';
    case 'payoutStatus':
      return rec.payoutStatus || '—';
    case 'transactionDate':
      return rec.transactionDate || '—';
    default:
      return '—';
  }
}

export function exportData({
  records,
  visibleColumns,
  includeHiddenColumns,
  format,
  fileName = 'mission_winners_export',
}: {
  records: MissionRecord[];
  visibleColumns: Record<ColumnKey, boolean>;
  includeHiddenColumns: boolean;
  format: 'csv' | 'xlsx';
  fileName?: string;
}): void {
  // Determine which columns to include in exact sequence
  const colsToExport = TABLE_COLUMNS.filter(col => includeHiddenColumns || visibleColumns[col.key]);

  if (colsToExport.length === 0) {
    alert('Please select at least one column to export.');
    return;
  }

  // Header row
  const headers = colsToExport.map(c => c.label);

  // Data rows
  const dataRows: (string | number)[][] = records.map(rec => {
    return colsToExport.map(col => getRecordValue(rec, col.key));
  });

  const sheetData = [headers, ...dataRows];

  // Create workbook using SheetJS
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mission Winners');

  const timestamp = new Date().toISOString().slice(0, 10);
  const fullFileName = `${fileName}_${timestamp}.${format}`;

  if (format === 'csv') {
    XLSX.writeFile(workbook, fullFileName, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, fullFileName, { bookType: 'xlsx' });
  }
}
