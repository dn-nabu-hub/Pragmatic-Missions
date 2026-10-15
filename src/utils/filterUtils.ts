/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MissionRecord, ColumnKey } from '../types';

/**
 * Extracts normalized display/filter value for any column of a record
 */
export function getColumnFilterValue(rec: MissionRecord, key: ColumnKey): string {
  switch (key) {
    case 'guid':
      return rec.player || '(Blanks)';
    case 'roundId':
      return rec.roundId || '(Blanks)';
    case 'missionNumber':
      return rec.missionNumber && rec.missionNumber !== '—'
        ? String(rec.missionNumber)
        : '(Blanks)';
    case 'operator':
      return rec.operator || '(Blanks)';
    case 'brand':
      return rec.brand || '(Blanks)';
    case 'winningDate':
      return rec.winningDate || '(Blanks)';
    case 'prizePlayerCurrency':
      return rec.prizePlayerCurrencyRaw !== '' && rec.prizePlayerCurrencyRaw !== '-'
        ? rec.prizePlayerCurrencyRaw
        : '(Blanks)';
    case 'currency':
      return rec.currency || '(Blanks)';
    case 'prizeReceived':
      return rec.prizeReceived || '(Blanks)';
    case 'prizeEur':
      return rec.prizeEurRaw !== '' && rec.prizeEurRaw !== '-'
        ? rec.prizeEurRaw
        : '(Blanks)';
    case 'prizeStatus':
      return rec.prizeStatus || '(Blanks)';
    case 'payoutStatus':
      return rec.payoutStatus || '(Blanks)';
    case 'transactionDate':
      return rec.transactionDate || '(Blanks)';
    default:
      return '(Blanks)';
  }
}

/**
 * Splits comma- or whitespace-separated GUIDs into clean tokens
 */
export function parseGuids(query: string): string[] {
  if (!query) return [];
  return query
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns distinct values and their occurrence count for a column
 */
export function getUniqueColumnValues(
  records: MissionRecord[],
  key: ColumnKey
): { value: string; count: number }[] {
  const map = new Map<string, number>();

  records.forEach((rec) => {
    const val = getColumnFilterValue(rec, key);
    map.set(val, (map.get(val) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      // Keep (Blanks) at the end
      if (a.value === '(Blanks)') return 1;
      if (b.value === '(Blanks)') return -1;

      // Try numeric sort for numeric columns
      const numA = parseFloat(a.value.replace(/[^0-9.-]/g, ''));
      const numB = parseFloat(b.value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(numA) && !isNaN(numB) && a.value === String(numA) && b.value === String(numB)) {
        return numA - numB;
      }

      return a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' });
    });
}
