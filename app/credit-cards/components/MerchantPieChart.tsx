'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CreditCardTransaction, MerchantSpend } from '../types';

interface MerchantPieChartProps {
  transactions: CreditCardTransaction[];
}

const PALETTE = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#64748b', // Slate
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: MerchantSpend = payload[0].payload;
    return (
      <div className="bg-base-100 border border-base-300 shadow-xl rounded-xl p-3 text-xs min-w-[220px]">
        <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-1.5 mb-1.5">
          <span className="font-bold text-sm text-base-content">
            {data.merchant}
          </span>
          <span className="badge badge-ghost badge-xs">{data.category}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-base-content/60">Total Spent:</span>
            <span className="font-bold text-primary">
              {data.totalAmount.toLocaleString()} VND
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Share of Spend:</span>
            <span className="font-semibold text-base-content">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Transactions:</span>
            <span className="text-base-content font-medium">
              {data.transactionCount}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function MerchantPieChart({ transactions }: MerchantPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Consider only debits (spends) for seller breakdown
  const spendTransactions = transactions.filter((t) => t.type === 'debit');
  const totalSpend = spendTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Group by cleanMerchant
  const groupMap: Record<string, { total: number; count: number; category: string }> = {};
  for (const t of spendTransactions) {
    const key = t.cleanMerchant;
    if (!groupMap[key]) {
      groupMap[key] = { total: 0, count: 0, category: t.category };
    }
    groupMap[key].total += t.amount;
    groupMap[key].count += 1;
  }

  const allSellers: MerchantSpend[] = Object.entries(groupMap)
    .map(([merchant, data]) => ({
      merchant,
      category: data.category,
      totalAmount: data.total,
      transactionCount: data.count,
      percentage: totalSpend > 0 ? (data.total / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Take top 8, group remaining into "Other Sellers"
  const topSellers = allSellers.slice(0, 8);
  const remainingSellers = allSellers.slice(8);
  const otherTotal = remainingSellers.reduce((s, it) => s + it.totalAmount, 0);
  const otherCount = remainingSellers.reduce((s, it) => s + it.transactionCount, 0);

  const chartData = [...topSellers];
  if (otherTotal > 0) {
    chartData.push({
      merchant: `Other Sellers (${remainingSellers.length})`,
      category: 'Various',
      totalAmount: otherTotal,
      transactionCount: otherCount,
      percentage: (otherTotal / totalSpend) * 100,
    });
  }

  if (spendTransactions.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-200 p-8 text-center text-sm text-base-content/60">
        No spend transactions found for this view.
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-2xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>🍕</span>
            <span>Spend by Seller / Merchant</span>
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Accounted and normalized across naming variations (e.g. King Food Market, Xanh SM, Hoàn Mỹ, Agoda)
          </p>
        </div>
        <div className="badge badge-primary badge-outline text-xs">
          {allSellers.length} Unique Sellers Identified
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Donut Chart (Spacious) */}
        <div className="lg:col-span-5 h-[320px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="totalAmount"
                nameKey="merchant"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={125}
                paddingAngle={2.5}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                    stroke="transparent"
                    className="cursor-pointer transition-opacity duration-200"
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.35
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Sellers Breakdown (Full width 2-column grid, NO ellipsis!) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-base-content/60 border-b border-base-200 pb-2">
            <span>Top Sellers & Spenders</span>
            <span>Spend / Share</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {chartData.map((item, idx) => {
              const color = PALETTE[idx % PALETTE.length];
              const isHovered = activeIndex === idx;
              return (
                <div
                  key={item.merchant}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'border-primary bg-primary/5 shadow-sm scale-[1.01]'
                      : 'border-base-200 bg-base-100 hover:bg-base-200/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      {/* Full merchant name - no truncation */}
                      <div className="font-semibold text-xs sm:text-sm text-base-content leading-snug">
                        {item.merchant}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="badge badge-ghost badge-xs text-[10px]">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-base-content/60">
                          {item.transactionCount} {item.transactionCount > 1 ? 'txns' : 'txn'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-base-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-base-content">
                      {item.totalAmount.toLocaleString()} <span className="font-normal text-[11px] text-base-content/60">VND</span>
                    </span>
                    <span className="badge badge-sm font-semibold text-primary bg-primary/10 border-0">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
