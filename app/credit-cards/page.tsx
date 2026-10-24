'use client';

import React, { useState } from 'react';
import FileUploadSection from './components/FileUploadSection';
import StatementSummaryCards from './components/StatementSummaryCards';
import SourceFilterTabs from './components/SourceFilterTabs';
import MerchantPieChart from './components/MerchantPieChart';
import DailySpendingBarChart from './components/DailySpendingBarChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import TransactionTable from './components/TransactionTable';
import { CreditCardTransaction, ParsedStatementResult } from './types';

export default function CreditCardVisualizerPage() {
  const [statements, setStatements] = useState<ParsedStatementResult[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const handleAddStatement = (newStmt: ParsedStatementResult) => {
    setStatements((prev) => {
      // Replace if existing by same fileName, else append
      const filtered = prev.filter(
        (s) => s.summary.fileName !== newStmt.summary.fileName
      );
      return [...filtered, newStmt];
    });
    setSelectedSource('all');
  };

  const handleRemoveStatement = (fileName: string) => {
    setStatements((prev) => prev.filter((s) => s.summary.fileName !== fileName));
    if (selectedSource === fileName) {
      setSelectedSource('all');
    }
  };

  // Derive active transactions based on selectedSource
  const activeTransactions: CreditCardTransaction[] = React.useMemo(() => {
    if (selectedSource === 'all') {
      return statements.flatMap((s) => s.transactions);
    }
    const found = statements.find((s) => s.summary.fileName === selectedSource);
    return found ? found.transactions : [];
  }, [statements, selectedSource]);

  const activeSummaries = React.useMemo(() => {
    if (selectedSource === 'all') {
      return statements.map((s) => s.summary);
    }
    const found = statements.find((s) => s.summary.fileName === selectedSource);
    return found ? [found.summary] : [];
  }, [statements, selectedSource]);

  const totalMergedCount = React.useMemo(() => {
    return statements.reduce((sum, s) => sum + s.transactions.length, 0);
  }, [statements]);

  const activeTitle = React.useMemo(() => {
    if (selectedSource === 'all') return 'All Statements (Merged)';
    const stmt = statements.find((s) => s.summary.fileName === selectedSource);
    return stmt ? `${stmt.summary.bank} (${stmt.summary.fileName})` : 'Statement';
  }, [selectedSource, statements]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Page Title & Subtitle */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-primary font-medium text-xs">
            Personal Finance
          </span>
          <span className="badge badge-ghost text-xs">
            Vietcombank & HSBC Supported
          </span>
          <span className="badge badge-success badge-outline text-xs">
            100% In-Memory & Secure
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
          Credit Card Statement Visualizer
        </h1>
        <p className="text-base text-base-content/75 max-w-3xl">
          Securely analyze, decrypt, and visualize your credit card spending patterns.
          Merge statements across banks while preserving source attribution, normalizes
          merchant naming variations, and displays daily spending trends.
        </p>
      </div>

      {/* File Upload & Password Decryption Section */}
      <FileUploadSection
        statements={statements}
        onAddStatement={handleAddStatement}
        onRemoveStatement={handleRemoveStatement}
      />

      {/* Live Dashboard Section (when statements are loaded) */}
      {statements.length > 0 && (
        <div className="space-y-8 pt-2">
          {/* Source Filter Switcher (Merged vs Single Statement) */}
          <SourceFilterTabs
            statements={statements}
            selectedSource={selectedSource}
            onSelectSource={setSelectedSource}
            totalMergedCount={totalMergedCount}
          />

          {/* Top Metric Cards */}
          <StatementSummaryCards
            transactions={activeTransactions}
            summaries={activeSummaries}
            activeSourceTitle={activeTitle}
          />

          {/* Chart 1: Spend by Seller / Merchant (Full Width) */}
          <MerchantPieChart transactions={activeTransactions} />

          {/* Chart 2: Daily Spending Timeline (Full Width, Vertically Arranged) */}
          <DailySpendingBarChart transactions={activeTransactions} />

          {/* Chart 3: Spending by Category Bar Chart (Full Width) */}
          <CategoryBreakdown transactions={activeTransactions} />

          {/* Transaction Records Table with Page Size 100 & Embedded Header Controls */}
          <TransactionTable transactions={activeTransactions} />
        </div>
      )}

      {/* Empty State */}
      {statements.length === 0 && (
        <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl shadow-sm">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="font-bold text-lg">No statements uploaded yet</h3>
          <p className="text-xs sm:text-sm text-base-content/60 max-w-md mx-auto mt-1">
            Drop your password-protected PDF statement above. You will be prompted to enter its password to extract transactions.
          </p>
        </div>
      )}
    </div>
  );
}
