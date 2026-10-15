/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MissionRecord {
  id: string;
  player: string;
  tag: string;
  roundId: string;
  roundIdNumber: number | null;
  missionNumber: number | string;
  missionNumberVal: number;
  operator: string;
  brand: string;
  winningDate: string;
  winningDateTimestamp: number;
  prizePlayerCurrency: number | null;
  prizePlayerCurrencyRaw: string;
  currency: string;
  prizeReceived: string;
  prizeEur: number | null;
  prizeEurRaw: string;
  prizeStatus: string;
  payoutStatus: string;
  transactionDate: string;
  transactionDateTimestamp: number;
}

export type ColumnKey =
  | 'guid'
  | 'roundId'
  | 'missionNumber'
  | 'operator'
  | 'brand'
  | 'winningDate'
  | 'prizePlayerCurrency'
  | 'currency'
  | 'prizeReceived'
  | 'prizeEur'
  | 'prizeStatus'
  | 'payoutStatus'
  | 'transactionDate';

export interface ColumnDefinition {
  key: ColumnKey;
  label: string;
  align: 'left' | 'right' | 'center';
  minWidth: string;
  isNumeric?: boolean;
  isDate?: boolean;
}

export type ColumnFilters = Partial<Record<ColumnKey, string[]>>;

export interface FilterState {
  searchQuery: string;
  guidQuery: string;
  columnFilters: ColumnFilters;
}

export interface SortConfig {
  key: ColumnKey;
  direction: 'asc' | 'desc';
}
