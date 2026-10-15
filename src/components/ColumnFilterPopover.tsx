/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, FilterX } from 'lucide-react';

interface ColumnFilterPopoverProps {
  columnLabel: string;
  options: { value: string; count: number }[];
  selectedValues?: string[]; // If undefined, all are currently selected
  onApply: (selected: string[] | undefined) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export const ColumnFilterPopover: React.FC<ColumnFilterPopoverProps> = ({
  columnLabel,
  options,
  selectedValues,
  onApply,
  onClose,
  anchorRect,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');

  // Local selection state initialized from props
  // If selectedValues is undefined, all options are selected
  const [localSelected, setLocalSelected] = useState<Set<string>>(() => {
    if (!selectedValues || selectedValues.length === 0) {
      return new Set(options.map((o) => o.value));
    }
    return new Set(selectedValues);
  });

  // Close on outside click or Escape key
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Position calculation
  const getStyle = (): React.CSSProperties => {
    if (!anchorRect) return { display: 'none' };

    const popoverWidth = 270;
    const padding = 12;

    let left = anchorRect.left;
    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }
    if (left < padding) left = padding;

    let top = anchorRect.bottom + 6;
    const expectedHeight = 320;
    if (top + expectedHeight > window.innerHeight - padding) {
      top = Math.max(padding, anchorRect.top - expectedHeight - 6);
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      zIndex: 60,
    };
  };

  const filteredOptions = options.filter((o) =>
    o.value.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  const handleToggleOption = (val: string) => {
    const next = new Set(localSelected);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    setLocalSelected(next);
  };

  const handleSelectAll = () => {
    setLocalSelected(new Set(options.map((o) => o.value)));
  };

  const handleClearAll = () => {
    setLocalSelected(new Set());
  };

  const handleApply = () => {
    // If all options are selected, it means no filter is applied
    if (localSelected.size === options.length) {
      onApply(undefined);
    } else {
      onApply(Array.from(localSelected));
    }
    onClose();
  };

  const handleResetFilter = () => {
    onApply(undefined);
    onClose();
  };

  const isFilterActive = selectedValues !== undefined && selectedValues.length < options.length;

  return (
    <div
      ref={popoverRef}
      style={getStyle()}
      className="bg-white rounded-lg border border-slate-200 shadow-xl p-3 flex flex-col text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <span className="font-semibold text-slate-900 truncate pr-2">
          Filter: {columnLabel}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
        <input
          type="text"
          placeholder="Search values..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-7 pr-6 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-[#084968]"
          autoFocus
        />
        {searchText && (
          <button
            type="button"
            onClick={() => setSearchText('')}
            className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Select All / Clear All Links */}
      <div className="flex items-center justify-between text-[11px] px-0.5 mb-1.5 text-slate-500">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[#084968] font-medium hover:underline cursor-pointer"
          >
            Select All
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-slate-500 hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
        <span className="text-slate-400 font-mono">
          {localSelected.size}/{options.length}
        </span>
      </div>

      {/* Options List */}
      <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 border border-slate-100 rounded-md p-1 bg-slate-50/50">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt) => {
            const isChecked = localSelected.has(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center justify-between gap-2 px-1.5 py-1 rounded hover:bg-slate-100/80 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleOption(opt.value)}
                    className="rounded border-slate-300 text-[#084968] focus:ring-[#084968] cursor-pointer"
                  />
                  <span
                    className={`truncate text-xs ${
                      opt.value === '(Blanks)'
                        ? 'text-slate-400 italic'
                        : 'text-slate-700'
                    }`}
                    title={opt.value}
                  >
                    {opt.value}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 tabular-nums">
                  {opt.count}
                </span>
              </label>
            );
          })
        ) : (
          <div className="py-4 text-center text-slate-400 text-xs">
            No values match "{searchText}"
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
        {isFilterActive ? (
          <button
            type="button"
            onClick={handleResetFilter}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <FilterX className="w-3 h-3" />
            <span>Reset</span>
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1 bg-[#084968] hover:bg-[#063952] text-white font-medium rounded shadow-xs cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
