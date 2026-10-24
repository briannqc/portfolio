'use client';

import React from 'react';
import { CreditCardTransaction, StatementSummary } from '../types';

interface StatementSummaryCardsProps {
  transactions: CreditCardTransaction[];
  summaries: StatementSummary[];
  activeSourceTitle: string;
}

export default function StatementSummaryCards({
  transactions,
  summaries,
  activeSourceTitle,
}: StatementSummaryCardsProps) {
  const debits = transactions.filter((t) => t.type === 'debit');
  const credits = transactions.filter((t) => t.type === 'credit');

  const totalSpend = debits.reduce((acc, t) => acc + t.amount, 0);
  const totalCredits = credits.reduce((acc, t) => acc + t.amount, 0);
  const netOutflow = totalSpend - totalCredits;

  // Find top merchant by spend
  const merchantTotals: Record<string, number> = {};
  for (const t of debits) {
    merchantTotals[t.cleanMerchant] = (merchantTotals[t.cleanMerchant] || 0) + t.amount;
  }

  let topMerchantName = 'N/A';
  let topMerchantAmount = 0;
  for (const [m, amt] of Object.entries(merchantTotals)) {
    if (amt > topMerchantAmount) {
      topMerchantAmount = amt;
      topMerchantName = m;
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-base-content/70">
          Overview: <span className="text-primary font-bold">{activeSourceTitle}</span>
        </h3>
        <span className="text-xs text-base-content/50">
          Showing {transactions.length} total transactions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Total Spend (Debit)
            </span>
            <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center font-bold text-xs">
              💸
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-error">
            {totalSpend.toLocaleString()} <span className="text-xs font-normal">VND</span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Across {debits.length} purchases & debits
          </p>
        </div>

        {/* Total Credits & Cashback */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Payments & Cashback
            </span>
            <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center font-bold text-xs">
              💰
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-success">
            {totalCredits.toLocaleString()} <span className="text-xs font-normal">VND</span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            {credits.length} credits (auto-pay & rewards)
          </p>
        </div>

        {/* Net Balance / Outflow */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Net Outflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              ⚖️
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-base-content">
            {netOutflow.toLocaleString()} <span className="text-xs font-normal">VND</span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Debits minus Credits
          </p>
        </div>

        {/* Top Seller */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Top Seller / Spender
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs">
              🏆
            </div>
          </div>
          <div className="mt-2 text-lg font-black tracking-tight text-secondary truncate" title={topMerchantName}>
            {topMerchantName}
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            {topMerchantAmount.toLocaleString()} VND total
          </p>
        </div>
      </div>
    </div>
  );
}
