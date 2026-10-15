/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColumnDefinition, ColumnKey } from '../types';

export const TABLE_COLUMNS: ColumnDefinition[] = [
  {
    key: 'guid',
    label: 'GUID',
    align: 'left',
    minWidth: '220px',
  },
  {
    key: 'roundId',
    label: 'Round ID',
    align: 'left',
    minWidth: '160px',
    isNumeric: true,
  },
  {
    key: 'missionNumber',
    label: 'Mission number',
    align: 'center',
    minWidth: '130px',
    isNumeric: true,
  },
  {
    key: 'operator',
    label: 'Operator',
    align: 'left',
    minWidth: '160px',
  },
  {
    key: 'brand',
    label: 'Brand',
    align: 'left',
    minWidth: '120px',
  },
  {
    key: 'winningDate',
    label: 'Winning Date',
    align: 'left',
    minWidth: '150px',
    isDate: true,
  },
  {
    key: 'prizePlayerCurrency',
    label: "Prize in player's currency",
    align: 'right',
    minWidth: '180px',
    isNumeric: true,
  },
  {
    key: 'currency',
    label: 'Currency',
    align: 'center',
    minWidth: '100px',
  },
  {
    key: 'prizeReceived',
    label: 'Prize Received',
    align: 'left',
    minWidth: '220px',
  },
  {
    key: 'prizeEur',
    label: 'Prize in main currency,EUR',
    align: 'right',
    minWidth: '190px',
    isNumeric: true,
  },
  {
    key: 'prizeStatus',
    label: 'Prize status',
    align: 'center',
    minWidth: '120px',
  },
  {
    key: 'payoutStatus',
    label: 'Payout status',
    align: 'center',
    minWidth: '130px',
  },
  {
    key: 'transactionDate',
    label: 'Transaction Date',
    align: 'left',
    minWidth: '150px',
    isDate: true,
  },
];

export const DEFAULT_VISIBLE_COLUMNS: Record<ColumnKey, boolean> = {
  guid: true,
  roundId: true,
  missionNumber: true,
  operator: true,
  brand: true,
  winningDate: true,
  prizePlayerCurrency: true,
  currency: true,
  prizeReceived: true,
  prizeEur: true,
  prizeStatus: true,
  payoutStatus: true,
  transactionDate: true,
};
