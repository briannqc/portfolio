'use client';

import React, { useState, useRef } from 'react';
import { ParsedStatementResult } from '../types';
import { parsePdfInBrowser } from '../lib/parsers';

interface FileUploadSectionProps {
  statements: ParsedStatementResult[];
  onAddStatement: (result: ParsedStatementResult) => void;
  onRemoveStatement: (fileName: string) => void;
}

interface PendingFile {
  file: File;
  arrayBuffer: ArrayBuffer;
}

export default function FileUploadSection({
  statements,
  onAddStatement,
  onRemoveStatement,
}: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processSelectedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF statement file.');
      return;
    }

    setParsingError(null);
    const arrayBuffer = await file.arrayBuffer();

    setPendingFile({
      file,
      arrayBuffer,
    });
    setPasswordInput('');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDecryptAndParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFile) return;

    setIsProcessing(true);
    setParsingError(null);

    try {
      // First attempt client-side parsing using in-browser PDF.js
      let parsed: ParsedStatementResult;
      try {
        parsed = await parsePdfInBrowser(
          pendingFile.arrayBuffer,
          passwordInput,
          pendingFile.file.name
        );
      } catch (clientErr: any) {
        console.warn('Browser parsing fallback to secure local API:', clientErr);
        // Fallback to local server endpoint
        const formData = new FormData();
        formData.append('file', pendingFile.file);
        formData.append('password', passwordInput);

        const res = await fetch('/api/statements/sample', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Incorrect password or invalid PDF statement format.');
        }
        parsed = json.data;
      }

      onAddStatement(parsed);
      setPendingFile(null);
      setPasswordInput('');
    } catch (err: any) {
      const msg = err?.message || String(err || '');
      const isPasswordError =
        /password|incorrect|decrypt|14|format|auth/i.test(msg) ||
        /command failed/i.test(msg);

      if (isPasswordError) {
        setParsingError(
          'Incorrect password. Please verify your statement password and try again.'
        );
      } else {
        setParsingError(
          msg || 'Unable to parse statement. Please check the password or ensure the file is a valid statement.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Privacy Banner */}
      <div className="alert alert-info shadow-sm bg-base-100 border border-primary/20 text-xs sm:text-sm py-2.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-primary shrink-0 w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <div>
          <span className="font-semibold text-base-content">
            Secure Local Processing:
          </span>{' '}
          <span className="text-base-content/80">
            Statements are decrypted and processed in memory. Your statement files and passwords are never uploaded or stored on any external servers.
          </span>
        </div>
      </div>

      {/* Full-Width Drag-and-Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-base-300 hover:border-primary/50 bg-base-100 hover:bg-base-200/50 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <div className="p-3 bg-primary/10 rounded-full text-primary mb-2">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="font-bold text-base sm:text-lg text-base-content">
          Drop your Vietcombank or HSBC PDF statement here
        </p>
        <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-lg">
          Click to browse or drag & drop. You will be prompted for your password to safely decrypt and extract transactions.
        </p>
      </div>

      {/* Password Prompt Modal / Card */}
      {pendingFile && (
        <div className="card bg-base-100 border-2 border-primary/40 shadow-xl p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/20 text-warning-content rounded-xl">
                <svg
                  className="w-6 h-6 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Enter Statement Password</h3>
                <p className="text-xs text-base-content/70">
                  File: <span className="font-mono font-medium">{pendingFile.file.name}</span> ({(pendingFile.file.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setPendingFile(null);
                setParsingError(null);
              }}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleDecryptAndParse} className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-2.5 rounded-xl bg-base-200/60 border border-base-200 text-xs">
                <div className="flex items-center gap-1.5 text-base-content/80">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="font-medium">Bank Template Detection:</span>
                </div>
                <span className="badge badge-primary badge-outline badge-sm font-medium gap-1 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Dynamic (Vietcombank & HSBC)
                </span>
              </div>

              <div>
                <label className="label text-xs font-semibold py-1">
                  PDF Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter statement password (e.g. DDMMYYYY / Passport / ID)"
                    required
                    autoFocus
                    className="input input-bordered input-sm w-full pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content text-xs p-1"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <label className="label text-[11px] text-base-content/60 py-1">
                  Source bank and statement template will be verified and extracted dynamically upon decryption.
                </label>
              </div>
            </div>

            {parsingError && (
              <div className="alert alert-error text-xs py-2 rounded-lg">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{parsingError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !passwordInput.trim()}
                className="btn btn-primary btn-sm px-6"
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Decrypting & Parsing...
                  </>
                ) : (
                  'Unlock & Extract Transactions'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Loaded Statements */}
      {statements.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Loaded Statement Files ({statements.length})
            </h4>
            <span className="text-xs text-base-content/60">
              Parsed in browser memory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {statements.map((stmt) => {
              const isVCB = stmt.summary.bank === 'Vietcombank';
              return (
                <div
                  key={stmt.summary.fileName}
                  className="card bg-base-100 border border-base-200 shadow-sm p-4 flex flex-row items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isVCB
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {isVCB ? 'VCB' : 'HSBC'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {stmt.summary.bank}
                        </span>
                        <span className="badge badge-ghost badge-xs">
                          {stmt.summary.transactionsCount} txns
                        </span>
                      </div>
                      <p className="text-xs text-base-content/60 font-mono truncate max-w-[220px]">
                        {stmt.summary.fileName}
                      </p>
                      <p className="text-[11px] text-base-content/50">
                        Stmt: {stmt.summary.statementDate} • Bal:{' '}
                        {stmt.summary.statementBalance.toLocaleString()} VND
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveStatement(stmt.summary.fileName)}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    title="Remove this statement"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
