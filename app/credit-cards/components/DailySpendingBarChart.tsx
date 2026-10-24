'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CreditCardTransaction, DailySpend } from '../types';

interface DailySpendingBarChartProps {
  transactions: CreditCardTransaction[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DailySpend = payload[0].payload;
    return (
      <div className="bg-base-100 border border-base-300 shadow-xl rounded-xl p-3 text-xs min-w-[220px]">
        <div className="flex items-center justify-between border-b border-base-200 pb-1.5 mb-1.5">
          <span className="font-bold text-sm text-base-content">
            {data.date}
          </span>
          <span className="badge badge-primary badge-xs">
            {data.transactionCount} {data.transactionCount > 1 ? 'txns' : 'txn'}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-base-content/60">Total Spent:</span>
            <span className="font-bold text-error">
              {data.totalAmount.toLocaleString()} VND
            </span>
          </div>
          {data.topMerchant && (
            <div className="flex justify-between gap-2">
              <span className="text-base-content/60 shrink-0">Top Merchant:</span>
              <span className="font-medium text-base-content truncate">
                {data.topMerchant}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function DailySpendingBarChart({
  transactions,
}: DailySpendingBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Consider only debits (spends)
  const spendTransactions = transactions.filter((t) => t.type === 'debit');

  // Group by txnDate (YYYY-MM-DD)
  const dailyMap: Record<string, CreditCardTransaction[]> = {};
  for (const t of spendTransactions) {
    if (!dailyMap[t.txnDate]) {
      dailyMap[t.txnDate] = [];
    }
    dailyMap[t.txnDate].push(t);
  }

  // Sort dates chronologically
  const sortedDates = Object.keys(dailyMap).sort();

  const chartData: DailySpend[] = sortedDates.map((date) => {
    const dayTxns = dailyMap[date];
    const totalAmount = dayTxns.reduce((sum, it) => sum + it.amount, 0);

    // Find top merchant that day
    const mCounts: Record<string, number> = {};
    for (const tx of dayTxns) {
      mCounts[tx.cleanMerchant] = (mCounts[tx.cleanMerchant] || 0) + tx.amount;
    }
    let topM = '';
    let topAmt = 0;
    for (const [m, amt] of Object.entries(mCounts)) {
      if (amt > topAmt) {
        topAmt = amt;
        topM = m;
      }
    }

    // Format display date: 2026-10-04 -> 04/10
    const parts = date.split('-');
    const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;

    return {
      date,
      displayDate,
      totalAmount,
      transactionCount: dayTxns.length,
      topMerchant: topM,
      transactions: dayTxns,
    };
  });

  // Calculate highest spend day
  let peakDay: DailySpend | null = null;
  for (const d of chartData) {
    if (!peakDay || d.totalAmount > peakDay.totalAmount) {
      peakDay = d;
    }
  }

  const formatYAxis = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return `${val}`;
  };

  if (spendTransactions.length === 0) {
    return null;
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <span>📊</span>
            <span>Daily Spending Timeline</span>
          </h3>
          <p className="text-xs text-base-content/60">
            Total expenditures per day across the statement period
          </p>
        </div>
        {peakDay && (
          <div className="badge badge-warning badge-outline gap-1.5 text-xs py-3 px-3">
            <span>🔥 Peak Day:</span>
            <span className="font-bold">{peakDay.date}</span>
            <span>({(peakDay.totalAmount / 1000000).toFixed(1)}M VND)</span>
          </div>
        )}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            onMouseMove={(state: any) => {
              if (state && state.activeTooltipIndex !== undefined) {
                const idx = Number(state.activeTooltipIndex);
                if (!isNaN(idx)) setHoveredIndex(idx);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="opacity-10"
            />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
              interval="preserveStartEnd"
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="totalAmount"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            >
              {chartData.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                const isPeak = peakDay && entry.date === peakDay.date;
                return (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      isPeak
                        ? '#f59e0b'
                        : isHovered
                        ? '#06b6d4'
                        : '#4f46e5'
                    }
                    className="transition-colors duration-150 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
