/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { MissionRecord } from '../types';

/**
 * Normalizes headers to key identifier
 */
function normalizeHeaderName(header: string): string {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[\s_-]+/g, ' ');
}

/**
 * Robust date parser supporting MM/DD/YY HH:mm, MM/DD/YYYY, ISO, and Excel serial dates
 */
export function parseDateToTimestamp(val: unknown): number {
  if (!val) return 0;
  if (typeof val === 'number') {
    // Excel serial date (days since 1899-12-30)
    if (val > 10000 && val < 60000) {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return isNaN(date.getTime()) ? 0 : date.getTime();
    }
  }

  const str = String(val).trim();
  if (!str || str === '-' || str === '—') return 0;

  // Try standard Date parsing
  const directDate = new Date(str);
  if (!isNaN(directDate.getTime())) {
    // If year is e.g. 26, directDate might interpret as 1926 or 2026. Let's inspect:
    const year = directDate.getFullYear();
    if (year < 1970) {
      directDate.setFullYear(year + 100);
    }
    return directDate.getTime();
  }

  // Handle M/D/YY H:mm or M/D/YYYY H:mm (e.g. 10/6/26 10:30)
  const match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (match) {
    const month = parseInt(match[1], 10) - 1;
    const day = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    const hours = match[4] ? parseInt(match[4], 10) : 0;
    const minutes = match[5] ? parseInt(match[5], 10) : 0;
    const seconds = match[6] ? parseInt(match[6], 10) : 0;
    const date = new Date(year, month, day, hours, minutes, seconds);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  }

  return 0;
}

/**
 * Formats a Round ID, expanding scientific notation if present (e.g. 9.51755E+13 -> 95175500000000)
 */
export function formatRoundId(val: unknown): { display: string; num: number | null } {
  if (val === null || val === undefined) return { display: '', num: null };
  const str = String(val).trim();
  if (!str || str === '-' || str === '—') return { display: '', num: null };

  // If in scientific notation (e.g. 9.51755E+13)
  if (/^[0-9.]+[eE][+-]?[0-9]+$/.test(str)) {
    const num = Number(str);
    if (!isNaN(num)) {
      // BigInt or fixed string to prevent scientific formatting
      try {
        const big = BigInt(Math.round(num));
        return { display: big.toString(), num };
      } catch {
        return { display: num.toLocaleString('fullwide', { useGrouping: false }), num };
      }
    }
  }

  const num = Number(str.replace(/,/g, ''));
  return { display: str, num: isNaN(num) ? null : num };
}

/**
 * Checks if a row looks like a header row
 */
function isHeaderRow(row: unknown[]): boolean {
  if (!row || !Array.isArray(row)) return false;
  const joined = row.map(c => normalizeHeaderName(String(c))).join(' ');
  return (
    (joined.includes('round id') || joined.includes('roundid')) &&
    (joined.includes('mission') || joined.includes('operator') || joined.includes('player'))
  );
}

/**
 * Checks if a row is completely empty
 */
function isEmptyRow(row: unknown[]): boolean {
  if (!row || !Array.isArray(row)) return true;
  return row.every(cell => cell === null || cell === undefined || String(cell).trim() === '');
}

/**
 * Parse rows into MissionRecord items
 */
export function parseSheetRows(rows: unknown[][]): MissionRecord[] {
  if (!rows || rows.length === 0) return [];

  let headerMap: Record<string, number> = {};
  let currentHeaderFound = false;

  const records: MissionRecord[] = [];
  let recordCounter = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (isEmptyRow(row)) continue;

    if (isHeaderRow(row)) {
      // Build header mapping
      headerMap = {};
      row.forEach((col, colIdx) => {
        const norm = normalizeHeaderName(String(col));
        if (norm.includes('player') && !norm.includes('currency')) {
          headerMap['player'] = colIdx;
        } else if (norm === 'tag') {
          headerMap['tag'] = colIdx;
        } else if (norm.includes('round id') || norm.includes('roundid')) {
          headerMap['roundId'] = colIdx;
        } else if (norm.includes('mission')) {
          headerMap['missionNumber'] = colIdx;
        } else if (norm.includes('operator')) {
          headerMap['operator'] = colIdx;
        } else if (norm.includes('brand')) {
          headerMap['brand'] = colIdx;
        } else if (norm.includes('winning date')) {
          headerMap['winningDate'] = colIdx;
        } else if (norm.includes('player') && norm.includes('currency')) {
          headerMap['prizePlayerCurrency'] = colIdx;
        } else if (norm === 'currency') {
          headerMap['currency'] = colIdx;
        } else if (norm.includes('prize received') || norm === 'prize') {
          headerMap['prizeReceived'] = colIdx;
        } else if (norm.includes('eur') || norm.includes('main currency')) {
          headerMap['prizeEur'] = colIdx;
        } else if (norm.includes('prize status')) {
          headerMap['prizeStatus'] = colIdx;
        } else if (norm.includes('payout status')) {
          headerMap['payoutStatus'] = colIdx;
        } else if (norm.includes('transaction date')) {
          headerMap['transactionDate'] = colIdx;
        }
      });
      currentHeaderFound = true;
      continue;
    }

    // If we haven't found a header yet, use position fallback based on standard order
    if (!currentHeaderFound && i === 0) {
      // First row might not have been recognized as header, or data starts immediately
      headerMap = {
        player: 0,
        tag: 1,
        roundId: 2,
        missionNumber: 3,
        operator: 4,
        brand: 5,
        winningDate: 6,
        prizePlayerCurrency: 7,
        currency: 8,
        prizeReceived: 9,
        prizeEur: 10,
        prizeStatus: 11,
        payoutStatus: 12,
        transactionDate: 13,
      };
      currentHeaderFound = true;
    }

    const getVal = (key: string): string => {
      const idx = headerMap[key];
      if (idx === undefined || idx < 0 || idx >= row.length) return '';
      const v = row[idx];
      return v === null || v === undefined ? '' : String(v).trim();
    };

    const player = getVal('player');
    const tag = getVal('tag');
    const rawRoundId = getVal('roundId');
    const rawMission = getVal('missionNumber');
    const operator = getVal('operator');
    const brand = getVal('brand');
    const winningDate = getVal('winningDate');
    const rawPrizePlayerCur = getVal('prizePlayerCurrency');
    const currency = getVal('currency');
    const prizeReceived = getVal('prizeReceived');
    const rawPrizeEur = getVal('prizeEur');
    const prizeStatus = getVal('prizeStatus');
    const payoutStatus = getVal('payoutStatus');
    const transactionDate = getVal('transactionDate');

    // Skip if basically all primary fields are blank
    if (!rawRoundId && !rawMission && !winningDate && !operator && !prizeReceived) {
      continue;
    }

    const { display: roundIdDisplay, num: roundIdNum } = formatRoundId(rawRoundId);

    // Parse mission number
    const missionNumVal = parseInt(rawMission.replace(/\D/g, ''), 10) || 0;

    // Parse prize in player currency
    let prizePlayerCurrencyNum: number | null = null;
    if (rawPrizePlayerCur !== '' && rawPrizePlayerCur !== '-' && rawPrizePlayerCur !== '—') {
      const parsed = parseFloat(rawPrizePlayerCur.replace(/,/g, ''));
      if (!isNaN(parsed)) prizePlayerCurrencyNum = parsed;
    }

    // Parse prize in EUR
    let prizeEurNum: number | null = null;
    if (rawPrizeEur !== '' && rawPrizeEur !== '-' && rawPrizeEur !== '—') {
      const parsed = parseFloat(rawPrizeEur.replace(/,/g, ''));
      if (!isNaN(parsed)) prizeEurNum = parsed;
    }

    recordCounter++;
    records.push({
      id: `rec_${recordCounter}_${rawRoundId || Math.random().toString(36).substring(2, 8)}`,
      player: player || 'Unknown Player',
      tag,
      roundId: roundIdDisplay || rawRoundId,
      roundIdNumber: roundIdNum,
      missionNumber: rawMission || '—',
      missionNumberVal: missionNumVal,
      operator: operator || '',
      brand: brand || '',
      winningDate: winningDate || '',
      winningDateTimestamp: parseDateToTimestamp(winningDate),
      prizePlayerCurrency: prizePlayerCurrencyNum,
      prizePlayerCurrencyRaw: rawPrizePlayerCur,
      currency: currency || '',
      prizeReceived: prizeReceived || '',
      prizeEur: prizeEurNum,
      prizeEurRaw: rawPrizeEur,
      prizeStatus: prizeStatus || '',
      payoutStatus: payoutStatus || '',
      transactionDate: transactionDate || '',
      transactionDateTimestamp: parseDateToTimestamp(transactionDate),
    });
  }

  return records;
}

/**
 * Main parser accepting ArrayBuffer from file upload (CSV or Excel)
 */
export function parseFileBuffer(buffer: ArrayBuffer): MissionRecord[] {
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: false,
    raw: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  return parseSheetRows(rows);
}

/**
 * Helper to parse plain text CSV
 */
export function parseCsvText(csvText: string): MissionRecord[] {
  const workbook = XLSX.read(csvText, {
    type: 'string',
    raw: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  return parseSheetRows(rows);
}
