/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  onFileUpload: (file: File) => void;
  errorMessage?: string | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onFileUpload,
  errorMessage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-xl border-2 border-dashed transition-all p-10 sm:p-12 text-center shadow-xs ${
          isDragging
            ? 'border-[#084968] bg-[#084968]/5 scale-[1.01]'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-100 flex items-center justify-center text-[#084968]">
          <FileSpreadsheet className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Upload Mission Data
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Drag and drop your Excel (<span className="font-mono">.xlsx</span>, <span className="font-mono">.xls</span>) or <span className="font-mono">.csv</span> file here.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#084968] hover:bg-[#063952] active:bg-[#052b3e] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Select File from Computer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
