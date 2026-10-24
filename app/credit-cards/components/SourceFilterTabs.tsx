'use client';

import React from 'react';
import { ParsedStatementResult } from '../types';

interface SourceFilterTabsProps {
  statements: ParsedStatementResult[];
  selectedSource: string; // 'all' or fileName
  onSelectSource: (source: string) => void;
  totalMergedCount: number;
}

export default function SourceFilterTabs({
  statements,
  selectedSource,
  onSelectSource,
  totalMergedCount,
}: SourceFilterTabsProps) {
  if (statements.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-base-300 pb-3">
      <span className="text-xs font-semibold text-base-content/60 mr-2">
        View Source:
      </span>

      {/* Merged View */}
      <button
        onClick={() => onSelectSource('all')}
        className={`btn btn-sm rounded-xl font-medium transition-all ${
          selectedSource === 'all'
            ? 'btn-primary shadow-sm'
            : 'btn-ghost hover:bg-base-200 text-base-content/70'
        }`}
      >
        <span className="text-base">✨</span>
        <span>All Statements (Merged)</span>
        <span
          className={`badge badge-xs ml-1 ${
            selectedSource === 'all' ? 'badge-neutral' : 'badge-ghost'
          }`}
        >
          {totalMergedCount}
        </span>
      </button>

      {/* Individual Statement Tabs */}
      {statements.map((stmt) => {
        const isSelected = selectedSource === stmt.summary.fileName;
        const isVCB = stmt.summary.bank === 'Vietcombank';
        return (
          <button
            key={stmt.summary.fileName}
            onClick={() => onSelectSource(stmt.summary.fileName)}
            className={`btn btn-sm rounded-xl font-medium transition-all ${
              isSelected
                ? isVCB
                  ? 'btn-accent text-accent-content shadow-sm'
                  : 'btn-error text-error-content shadow-sm'
                : 'btn-ghost hover:bg-base-200 text-base-content/70'
            }`}
          >
            <span>{isVCB ? '🏦' : '🏛️'}</span>
            <span>{stmt.summary.bank}</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({stmt.summary.accountOrCard.slice(-4)})
            </span>
            <span
              className={`badge badge-xs ml-1 ${
                isSelected ? 'badge-neutral' : 'badge-ghost'
              }`}
            >
              {stmt.transactions.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
