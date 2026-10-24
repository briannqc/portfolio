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
import { CreditCardTransaction } from '../types';

interface CategoryBreakdownProps {
  transactions: CreditCardTransaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Groceries & Supermarket': '#10b981', // Emerald
  'Healthcare & Pharmacy': '#06b6d4', // Cyan
  'Insurance': '#6366f1', // Indigo
  'Transportation': '#f59e0b', // Amber
  'Shopping & E-Commerce': '#ec4899', // Pink
  'Dining & Cafes': '#f97316', // Orange
  'Utilities & Bills': '#8b5cf6', // Violet
  'Digital & Tech': '#3b82f6', // Blue
  'Travel & Hotel': '#14b8a6', // Teal
  'Others': '#64748b', // Slate
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-base-100 border border-base-300 shadow-xl rounded-xl p-3 text-xs min-w-[200px]">
        <div className="font-bold text-sm text-base-content border-b border-base-200 pb-1 mb-1.5">
          {data.category}
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

export default function CategoryBreakdown({
  transactions,
}: CategoryBreakdownProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const debits = transactions.filter((t) => t.type === 'debit');
  const totalSpend = debits.reduce((acc, t) => acc + t.amount, 0);

  const catMap: Record<string, { total: number; count: number }> = {};
  for (const t of debits) {
    const cat = t.category || 'Others';
    if (!catMap[cat]) {
      catMap[cat] = { total: 0, count: 0 };
    }
    catMap[cat].total += t.amount;
    catMap[cat].count += 1;
  }

  // Sorted descending by total spend, with "Others" moved to the last position
  const categories = Object.entries(catMap)
    .map(([category, data]) => ({
      category,
      totalAmount: data.total,
      transactionCount: data.count,
      percentage: totalSpend > 0 ? (data.total / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => {
      if (a.category === 'Others') return 1;
      if (b.category === 'Others') return -1;
      return b.totalAmount - a.totalAmount;
    })
    .slice(0, 10);

  if (categories.length === 0) return null;

  const formatXAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-2xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>🏷️</span>
            <span>Spending by Category</span>
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Consolidated breakdown across 10 primary spending categories
          </p>
        </div>
        <div className="badge badge-neutral badge-outline text-xs">
          Top {categories.length} Categories
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={categories}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
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
              horizontal={false}
              stroke="currentColor"
              className="opacity-10"
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
              tickFormatter={formatXAxis}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
            />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={{ stroke: 'currentColor', opacity: 0.15 }}
              tick={{ fontSize: 12, fill: 'currentColor', fontWeight: 500 }}
              width={160}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="totalAmount"
              radius={[0, 6, 6, 0]}
              animationDuration={800}
            >
              {categories.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                const baseColor =
                  CATEGORY_COLORS[entry.category] || '#6366f1';
                return (
                  <Cell
                    key={`cat-bar-${index}`}
                    fill={baseColor}
                    opacity={
                      hoveredIndex === null || isHovered ? 1 : 0.4
                    }
                    className="cursor-pointer transition-opacity duration-200"
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
