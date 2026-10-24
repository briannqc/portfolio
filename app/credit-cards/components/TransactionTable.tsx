'use client';

import React, { useState, useMemo } from 'react';
import { BankType, CreditCardTransaction } from '../types';

interface TransactionTableProps {
  transactions: CreditCardTransaction[];
}

type SortField = 'date' | 'merchant' | 'amount' | 'bank';
type SortOrder = 'asc' | 'desc';

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  // Embedded Header Filters
  const [bankFilter, setBankFilter] = useState<'all' | BankType>('all');
  const [merchantQuery, setMerchantQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');

  // Embedded Header Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination with requested 100 default page size
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(100);

  // Extract unique categories from current transactions (with Others at the end)
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort((a, b) => {
      if (a === 'Others') return 1;
      if (b === 'Others') return -1;
      return a.localeCompare(b);
    });
  }, [transactions]);

  // Handle header click to sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default date to desc, text/amount to natural
      setSortOrder(field === 'date' || field === 'amount' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (bankFilter !== 'all' && t.bank !== bankFilter) return false;
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (merchantQuery.trim()) {
          const q = merchantQuery.toLowerCase();
          const matchMerchant = t.cleanMerchant.toLowerCase().includes(q);
          const matchRaw = t.rawDescription.toLowerCase().includes(q);
          if (!matchMerchant && !matchRaw) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'date') {
          diff = a.txnDate.localeCompare(b.txnDate);
        } else if (sortField === 'merchant') {
          diff = a.cleanMerchant.localeCompare(b.cleanMerchant);
        } else if (sortField === 'amount') {
          diff = a.amount - b.amount;
        } else if (sortField === 'bank') {
          diff = a.bank.localeCompare(b.bank);
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [
    transactions,
    bankFilter,
    typeFilter,
    categoryFilter,
    merchantQuery,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const pagedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasActiveFilters =
    bankFilter !== 'all' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    merchantQuery.trim() !== '';

  const clearAllFilters = () => {
    setBankFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setMerchantQuery('');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Bank',
      'Source File',
      'Card/Account',
      'Txn Date',
      'Post Date',
      'Clean Merchant',
      'Category',
      'Type',
      'Amount (VND)',
      'Raw Description',
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.bank}"`,
      `"${t.sourceFile}"`,
      `"${t.accountOrCard}"`,
      `"${t.txnDate}"`,
      `"${t.postDate}"`,
      `"${t.cleanMerchant.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.type}"`,
      t.amount,
      `"${t.rawDescription.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `credit_card_transactions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="opacity-30 text-[10px] ml-1">⇅</span>
      );
    }
    return (
      <span className="text-primary font-bold text-xs ml-1">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-2xl w-full space-y-4">
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>📋</span>
            <span>Transaction Records</span>
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Showing {filteredTransactions.length} of {transactions.length} total transactions • Page size: {pageSize}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="btn btn-ghost btn-xs text-xs text-error hover:bg-error/10"
            >
              Reset Filters
            </button>
          )}

          {/* Page size picker */}
          <div className="flex items-center gap-1 text-xs text-base-content/60">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="select select-bordered select-xs text-xs"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="btn btn-outline btn-xs sm:btn-sm text-xs gap-1"
            title="Download CSV report"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Modern Table with Embedded Header Sorting & Filtering */}
      <div className="overflow-x-auto rounded-xl border border-base-200">
        <table className="table table-zebra table-sm w-full text-xs">
          <thead className="bg-base-200/80 text-base-content">
            {/* Row 1: Column Titles & Clickable Sort */}
            <tr className="border-b border-base-300">
              {/* Bank Header */}
              <th className="py-2.5">
                <button
                  onClick={() => handleSort('bank')}
                  className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors"
                >
                  Bank {getSortIcon('bank')}
                </button>
              </th>

              {/* Date Header */}
              <th className="py-2.5 whitespace-nowrap">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors"
                >
                  Txn Date {getSortIcon('date')}
                </button>
              </th>

              {/* Merchant Header */}
              <th className="py-2.5">
                <button
                  onClick={() => handleSort('merchant')}
                  className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors"
                >
                  Seller / Merchant {getSortIcon('merchant')}
                </button>
              </th>

              {/* Category Header */}
              <th className="py-2.5">
                <span className="font-bold text-xs uppercase tracking-wider">
                  Category
                </span>
              </th>

              {/* Amount / Type Header */}
              <th className="py-2.5 text-right">
                <button
                  onClick={() => handleSort('amount')}
                  className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors"
                >
                  Amount (VND) {getSortIcon('amount')}
                </button>
              </th>

              {/* Raw Statement Text */}
              <th className="hidden lg:table-cell py-2.5">
                <span className="font-bold text-xs uppercase tracking-wider text-base-content/60">
                  Raw Statement Note
                </span>
              </th>
            </tr>

            {/* Row 2: Embedded Header Filter Controls */}
            <tr className="bg-base-200/40 border-b border-base-300">
              {/* Bank Filter */}
              <th className="p-1.5">
                <select
                  value={bankFilter}
                  onChange={(e) => {
                    setBankFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="select select-bordered select-xs w-full font-normal text-[11px]"
                >
                  <option value="all">All Banks</option>
                  <option value="Vietcombank">VCB</option>
                  <option value="HSBC">HSBC</option>
                </select>
              </th>

              {/* Date Filter note */}
              <th className="p-1.5 text-center text-[10px] text-base-content/50 font-normal">
                {sortField === 'date' && (sortOrder === 'desc' ? 'Newest ▼' : 'Oldest ▲')}
              </th>

              {/* Merchant Search input */}
              <th className="p-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={merchantQuery}
                    onChange={(e) => {
                      setMerchantQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Filter seller..."
                    className="input input-bordered input-xs w-full text-[11px] pr-5 font-normal"
                  />
                  {merchantQuery && (
                    <button
                      onClick={() => setMerchantQuery('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-base-content/50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </th>

              {/* Category Filter */}
              <th className="p-1.5">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="select select-bordered select-xs w-full font-normal text-[11px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </th>

              {/* Type Filter (Spend vs Payment/Credit) */}
              <th className="p-1.5 text-right">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="select select-bordered select-xs font-normal text-[11px]"
                >
                  <option value="all">All Types</option>
                  <option value="debit">Spend Only (-)</option>
                  <option value="credit">Credits (+)</option>
                </select>
              </th>

              {/* Raw note column placeholder */}
              <th className="hidden lg:table-cell p-1.5 text-[10px] text-base-content/40 font-normal">
                Original text
              </th>
            </tr>
          </thead>

          <tbody>
            {pagedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-base-content/60">
                  <div className="text-2xl mb-1">🔍</div>
                  <p className="font-semibold">No transactions match your header filters</p>
                  <button
                    onClick={clearAllFilters}
                    className="btn btn-primary btn-xs mt-2"
                  >
                    Clear All Filters
                  </button>
                </td>
              </tr>
            ) : (
              pagedTransactions.map((t) => {
                const isVCB = t.bank === 'Vietcombank';
                const isDebit = t.type === 'debit';
                return (
                  <tr key={t.id} className="hover">
                    <td>
                      <span
                        className={`badge badge-xs font-bold py-2 px-1.5 ${
                          isVCB
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {isVCB ? 'VCB' : 'HSBC'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-mono text-base-content/80">
                      <div className="font-medium">{t.txnDate}</div>
                      {t.postDate !== t.txnDate && (
                        <div className="text-[10px] text-base-content/40">
                          Post: {t.postDate}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="font-semibold text-base-content text-xs sm:text-sm">
                        {t.cleanMerchant}
                      </div>
                      <div className="text-[10px] text-base-content/50 lg:hidden font-mono truncate max-w-[200px]">
                        {t.rawDescription}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm text-[11px] whitespace-nowrap">
                        {t.category}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          isDebit ? 'text-error' : 'text-success'
                        }`}
                      >
                        {isDebit ? '-' : '+'}
                        {t.amount.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal opacity-70">
                          VND
                        </span>
                      </span>
                    </td>
                    <td
                      className="hidden lg:table-cell text-base-content/60 font-mono text-[11px] max-w-[280px] truncate"
                      title={t.rawDescription}
                    >
                      {t.rawDescription}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-base-content/60">
        <div>
          Showing{' '}
          <span className="font-bold text-base-content">
            {filteredTransactions.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            -
            {Math.min(currentPage * pageSize, filteredTransactions.length)}
          </span>{' '}
          of{' '}
          <span className="font-bold text-base-content">
            {filteredTransactions.length}
          </span>{' '}
          transactions (Page {currentPage} of {totalPages})
        </div>

        {totalPages > 1 && (
          <div className="join">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="join-item btn btn-xs btn-outline"
            >
              « Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="join-item btn btn-xs btn-outline"
            >
              Next »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
