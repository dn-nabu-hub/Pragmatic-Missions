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
 * Robust date parser and formatter that converts mm/d/yy hh:mm and Excel serial numbers
 * into strict dd/mm/yyyy hh:mm format
 */
export function formatDateTime(val: unknown): { formatted: string; timestamp: number } {
  if (val === null || val === undefined) {
    return { formatted: '', timestamp: 0 };
  }

  // 1. If it's already a Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return { formatted: '', timestamp: 0 };
    const dd = String(val.getDate()).padStart(2, '0');
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const yyyy = String(val.getFullYear());
    const hh = String(val.getHours()).padStart(2, '0');
    const min = String(val.getMinutes()).padStart(2, '0');
    return {
      formatted: `${dd}/${mm}/${yyyy} ${hh}:${min}`,
      timestamp: val.getTime(),
    };
  }

  // 2. If it's an Excel serial date number (number or numeric string like 46301.570381944446)
  const numVal = typeof val === 'number' ? val : Number(String(val).trim());
  if (!isNaN(numVal) && numVal > 20000 && numVal < 100000) {
    // Excel serial day 25569 = 1970-01-01
    // Total milliseconds in UTC preserves exact wall-clock date and time from spreadsheet
    const totalMs = Math.round((numVal - 25569) * 86400 * 1000);
    const date = new Date(totalMs);
    if (!isNaN(date.getTime())) {
      const dd = String(date.getUTCDate()).padStart(2, '0');
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = String(date.getUTCFullYear());
      const hh = String(date.getUTCHours()).padStart(2, '0');
      const min = String(date.getUTCMinutes()).padStart(2, '0');
      return {
        formatted: `${dd}/${mm}/${yyyy} ${hh}:${min}`,
        timestamp: totalMs,
      };
    }
  }

  const str = String(val).trim();
  if (!str || str === '-' || str === '—') {
    return { formatted: '', timestamp: 0 };
  }

  // 3. Format: mm/dd/yy hh:mm or m/d/yy h:mm or mm/dd/yyyy hh:mm
  // In the file the format is mm/d/yy hh:mm -> convert to dd/mm/yyyy hh:mm
  const mdMatch = str.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?$/
  );
  if (mdMatch) {
    const month = parseInt(mdMatch[1], 10);
    const day = parseInt(mdMatch[2], 10);
    let year = parseInt(mdMatch[3], 10);
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    const hours = mdMatch[4] ? parseInt(mdMatch[4], 10) : 0;
    const minutes = mdMatch[5] ? parseInt(mdMatch[5], 10) : 0;

    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yyyy = String(year);
    const hh = String(hours).padStart(2, '0');
    const min = String(minutes).padStart(2, '0');

    const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();
    return {
      formatted: `${dd}/${mm}/${yyyy} ${hh}:${min}`,
      timestamp: isNaN(timestamp) ? 0 : timestamp,
    };
  }

  // 4. Format: ISO yyyy-mm-dd hh:mm
  const isoMatch = str.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::\d{2})?)?$/
  );
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    const hours = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
    const minutes = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;

    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yyyy = String(year);
    const hh = String(hours).padStart(2, '0');
    const min = String(minutes).padStart(2, '0');

    const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();
    return {
      formatted: `${dd}/${mm}/${yyyy} ${hh}:${min}`,
      timestamp: isNaN(timestamp) ? 0 : timestamp,
    };
  }

  // 5. Fallback to standard Date parsing
  const fallbackDate = new Date(str);
  if (!isNaN(fallbackDate.getTime())) {
    const dd = String(fallbackDate.getDate()).padStart(2, '0');
    const mm = String(fallbackDate.getMonth() + 1).padStart(2, '0');
    const yyyy = String(fallbackDate.getFullYear());
    const hh = String(fallbackDate.getHours()).padStart(2, '0');
    const min = String(fallbackDate.getMinutes()).padStart(2, '0');
    return {
      formatted: `${dd}/${mm}/${yyyy} ${hh}:${min}`,
      timestamp: fallbackDate.getTime(),
    };
  }

  return { formatted: str, timestamp: 0 };
}

export function parseDateToTimestamp(val: unknown): number {
  return formatDateTime(val).timestamp;
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

    const getRawVal = (key: string): unknown => {
      const idx = headerMap[key];
      if (idx === undefined || idx < 0 || idx >= row.length) return undefined;
      return row[idx];
    };

    const player = getVal('player');
    const tag = getVal('tag');
    const rawRoundId = getVal('roundId');
    const rawMission = getVal('missionNumber');
    const operator = getVal('operator');
    const brand = getVal('brand');
    const rawWinningDate = getRawVal('winningDate');
    const rawPrizePlayerCur = getVal('prizePlayerCurrency');
    const currency = getVal('currency');
    const prizeReceived = getVal('prizeReceived');
    const rawPrizeEur = getVal('prizeEur');
    const prizeStatus = getVal('prizeStatus');
    const payoutStatus = getVal('payoutStatus');
    const rawTransactionDate = getRawVal('transactionDate');

    // Skip if basically all primary fields are blank
    if (!rawRoundId && !rawMission && !rawWinningDate && !operator && !prizeReceived) {
      continue;
    }

    const { display: roundIdDisplay, num: roundIdNum } = formatRoundId(rawRoundId);

    // Format dates strictly to dd/mm/yyyy hh:mm
    const { formatted: winningDateFormatted, timestamp: winningDateTimestamp } =
      formatDateTime(rawWinningDate);
    const { formatted: transactionDateFormatted, timestamp: transactionDateTimestamp } =
      formatDateTime(rawTransactionDate);

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
      winningDate: winningDateFormatted,
      winningDateTimestamp,
      prizePlayerCurrency: prizePlayerCurrencyNum,
      prizePlayerCurrencyRaw: rawPrizePlayerCur,
      currency: currency || '',
      prizeReceived: prizeReceived || '',
      prizeEur: prizeEurNum,
      prizeEurRaw: rawPrizeEur,
      prizeStatus: prizeStatus || '',
      payoutStatus: payoutStatus || '',
      transactionDate: transactionDateFormatted,
      transactionDateTimestamp,
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
